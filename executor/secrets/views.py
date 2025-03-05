import logging
from typing import Union
from datetime import timezone

from django.http import HttpResponse
from google.protobuf.wrappers_pb2 import BoolValue, StringValue

from accounts.models import Account, get_request_account, get_request_user
from executor.models import Secret
from playbooks.utils.decorators import web_api
from playbooks.utils.meta import get_meta
from playbooks.utils.queryset import filter_page
from protos.base_pb2 import Message
from protos.secrets.api_pb2 import (
    GetSecretsRequest, GetSecretsResponse, 
    GetSecretRequest, GetSecretResponse,
    CreateSecretRequest, CreateSecretResponse,
    UpdateSecretRequest, UpdateSecretResponse,
    Secret as SecretProto,
    UpdateSecretOp
)

logger = logging.getLogger(__name__)


def _mask_secret_value(value):
    """Mask the secret value, showing only the first and last characters"""
    if not value or len(value) <= 8:
        return "••••••••"
    return value[:2] + "••••••" + value[-2:]


def _secret_to_proto(secret: Secret) -> SecretProto:
    """Convert a Secret model to a Secret proto"""
    return SecretProto(
        id=StringValue(value=str(secret.id)),
        key=StringValue(value=secret.key),
        masked_value=StringValue(value=_mask_secret_value(secret.value)),
        description=StringValue(value=secret.description or ""),
        creator=StringValue(value=secret.creator.email if secret.creator else ""),
        last_updated_by=StringValue(value=secret.last_updated_by.email if secret.last_updated_by else ""),
        created_at=int(secret.created_at.replace(tzinfo=timezone.utc).timestamp()) if secret.created_at else 0,
        updated_at=int(secret.updated_at.replace(tzinfo=timezone.utc).timestamp()) if secret.updated_at else 0,
        is_active=secret.is_active
    )


@web_api(GetSecretsRequest)
def secrets_list(request_message: GetSecretsRequest) -> Union[GetSecretsResponse, HttpResponse]:
    """List all active secrets for the current account"""
    account: Account = get_request_account()
    
    # Get all active secrets for this account
    qs = Secret.objects.filter(account=account, is_active=True)
    
    # Apply pagination
    total_count = qs.count()
    page = request_message.meta.page
    secrets = [_secret_to_proto(secret) for secret in filter_page(qs.order_by("-created_at"), page)]
    
    return GetSecretsResponse(
        meta=get_meta(page=page, total_count=total_count),
        success=BoolValue(value=True),
        secrets=secrets
    )


@web_api(GetSecretRequest)
def secret_get(request_message: GetSecretRequest) -> Union[GetSecretResponse, HttpResponse]:
    """Get a specific secret by ID"""
    account: Account = get_request_account()
    secret_id = request_message.secret_id.value
    
    if not secret_id:
        return GetSecretResponse(
            meta=get_meta(),
            success=BoolValue(value=False),
            message=Message(title="Invalid Request", description="Secret ID is required")
        )
    
    try:
        secret = Secret.objects.get(id=secret_id, account=account, is_active=True)
        return GetSecretResponse(
            meta=get_meta(),
            success=BoolValue(value=True),
            secret=_secret_to_proto(secret)
        )
    except Secret.DoesNotExist:
        return GetSecretResponse(
            meta=get_meta(),
            success=BoolValue(value=False),
            message=Message(title="Not Found", description="Secret not found")
        )


@web_api(CreateSecretRequest)
def secret_create(request_message: CreateSecretRequest) -> Union[CreateSecretResponse, HttpResponse]:
    """Create a new secret"""
    account: Account = get_request_account()
    user = get_request_user()

    key = request_message.key.value
    value = request_message.value.value
    description = request_message.description.value
    
    # Validate required fields
    if not key or not value:
        return CreateSecretResponse(
            meta=get_meta(),
            success=BoolValue(value=False),
            message=Message(title="Invalid Request", description="Key, and value are required")
        )
    
    # Check if key already exists for this account
    if Secret.objects.filter(account=account, key=key, is_active=True).exists():
        return CreateSecretResponse(
            meta=get_meta(),
            success=BoolValue(value=False),
            message=Message(title="Duplicate Key", description=f"A secret with key '{key}' already exists")
        )
    
    # Create the secret
    try:
        secret = Secret.objects.create(
            account=account,
            key=key,
            value=value,
            description=description,
            creator=user,
            last_updated_by=user,
            is_active=True
        )
        
        return CreateSecretResponse(
            meta=get_meta(),
            success=BoolValue(value=True),
            message=Message(title="Success", description="Secret created successfully"),
            secret=_secret_to_proto(secret)
        )
    except Exception as e:
        logger.error(f"Error creating secret: {str(e)}")
        return CreateSecretResponse(
            meta=get_meta(),
            success=BoolValue(value=False),
            message=Message(title="Error", description="Failed to create secret")
        )


@web_api(UpdateSecretRequest)
def secret_update(request_message: UpdateSecretRequest) -> Union[UpdateSecretResponse, HttpResponse]:
    """Update a secret using operations"""
    account: Account = get_request_account()
    user = get_request_user()
    
    update_secret_ops = request_message.update_secret_ops
    
    if not update_secret_ops:
        return UpdateSecretResponse(
            meta=get_meta(),
            success=BoolValue(value=False),
            message=Message(title="Invalid Request", description="No update operations provided")
        )
    
    # All operations should reference the same secret
    secret_ids = set(op.secret_id.value for op in update_secret_ops)
    if len(secret_ids) != 1:
        return UpdateSecretResponse(
            meta=get_meta(),
            success=BoolValue(value=False),
            message=Message(title="Invalid Request", description="All operations must reference the same secret")
        )
    
    secret_id = list(secret_ids)[0]
    
    try:
        secret = Secret.objects.get(id=secret_id, account=account, is_active=True)
        
        # Store the original user for later restoration
        original_last_updated_by = secret.last_updated_by
        
        # Set the user who is making the update
        secret.last_updated_by = user
        secret.save(update_fields=['last_updated_by'])
        
        try:
            # Apply all update operations
            from executor.secrets.crud.secrets_update_processor import secrets_update_processor
            secrets_update_processor.update(secret, update_secret_ops)
            
            # Get the updated secret
            updated_secret = Secret.objects.get(id=secret_id)
            
            return UpdateSecretResponse(
                meta=get_meta(),
                success=BoolValue(value=True),
                message=Message(title="Success", description="Secret updated successfully"),
                secret=_secret_to_proto(updated_secret)
            )
        except Exception as e:
            # Restore the original user if update fails
            secret.last_updated_by = original_last_updated_by
            secret.save(update_fields=['last_updated_by'])
            
            logger.error(f"Error updating secret: {str(e)}")
            return UpdateSecretResponse(
                meta=get_meta(),
                success=BoolValue(value=False),
                message=Message(title="Error", description=str(e))
            )
    except Secret.DoesNotExist:
        return UpdateSecretResponse(
            meta=get_meta(),
            success=BoolValue(value=False),
            message=Message(title="Not Found", description="Secret not found")
        )
    except Exception as e:
        logger.error(f"Error updating secret: {str(e)}")
        return UpdateSecretResponse(
            meta=get_meta(),
            success=BoolValue(value=False),
            message=Message(title="Error", description="Failed to update secret")
        )