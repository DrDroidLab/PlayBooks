import logging
from typing import Union
from django.http import HttpResponse
from google.protobuf.wrappers_pb2 import BoolValue, StringValue

from accounts.models import Account, get_request_account, get_request_user
from executor.models import Secret
from playbooks.utils.decorators import web_api
from playbooks.utils.meta import get_meta
from playbooks.utils.queryset import filter_page
from protos.base_pb2 import Message, Meta, Page
from protos.secrets.api_pb2 import (
    GetSecretsRequest, GetSecretsResponse, 
    GetSecretRequest, GetSecretResponse,
    CreateSecretRequest, CreateSecretResponse,
    UpdateSecretRequest, UpdateSecretResponse,
)
from executor.secrets.crud.secrets_crud_manager import secrets_crud_manager

logger = logging.getLogger(__name__)

@web_api(GetSecretsRequest)
def secrets_list(request_message: GetSecretsRequest) -> Union[GetSecretsResponse, HttpResponse]:
    """List secrets with optional filtering by IDs or key"""
    account: Account = get_request_account()
    user = get_request_user()
    meta: Meta = request_message.meta
    show_inactive = meta.show_inactive if meta.show_inactive else False
    page: Page = meta.page

    # Get secret IDs if provided
    secret_ids = request_message.secret_ids if request_message.secret_ids else None
    
    # Get key filter if provided
    key_filter = request_message.key.value if request_message.key else None
    
    # Determine if we should show inactive secrets
    show_inactive_value = show_inactive.value if show_inactive else False
    
    # Use the CRUD manager to get the queryset, including user filtering
    qs = secrets_crud_manager.list_secrets(
        account_id=account.id,
        secret_ids=secret_ids,
        key_filter=key_filter,
        show_inactive=show_inactive_value
    )

    total_count = qs.count()
    qs = filter_page(qs, page)

    # Use appropriate proto conversion based on list_all flag
    secrets = [secret.to_proto(include_masked_value=False) for secret in qs]
    return GetSecretsResponse(
        meta=get_meta(page=page, total_count=total_count),
        success=BoolValue(value=True),
        secrets=secrets
    )


@web_api(GetSecretRequest)
def secret_get(request_message: GetSecretRequest) -> Union[GetSecretResponse, HttpResponse]:
    """Get a specific secret by ID"""
    account: Account = get_request_account()
    user = get_request_user()
    secret_id = request_message.secret_id.value

    if not secret_id:
        return GetSecretResponse(
            meta=get_meta(),
            success=BoolValue(value=False),
            message=Message(title="Invalid Request", description="Secret ID is required")
        )

    # Use the CRUD manager to get the secret
    secret = secrets_crud_manager.get_by_id(secret_id, account.id)
    if secret:
        if secrets_crud_manager.verify_ownership(secret, account.id, user.id):
            return GetSecretResponse(
                meta=get_meta(),
                success=BoolValue(value=True),
                secret=secret.to_proto()
            )
        else:
            # Do not show even masked value if user wasn't the creator
            return GetSecretResponse(
                meta=get_meta(),
                success=BoolValue(value=True),
                secret=secret.to_proto(include_masked_value=False)
            )
    else:
        return GetSecretResponse(
            meta=get_meta(),
            success=BoolValue(value=False),
            message=Message(title="Not Found", description="Secret not found or you don't have permission to view it")
        )


@web_api(CreateSecretRequest)
def secret_create(request_message: CreateSecretRequest) -> Union[CreateSecretResponse, HttpResponse]:
    """Create a new secret"""
    account: Account = get_request_account()
    user = get_request_user()

    key = request_message.key.value
    value = request_message.value.value
    description = request_message.description.value
    
    # Use the CRUD manager to create the secret
    result = secrets_crud_manager.create_secret(
        account_id=account.id,
        key=key,
        value=value,
        description=description,
        user=user
    )

    # If result is a string, it's an error message
    if isinstance(result, str):
        return CreateSecretResponse(
            meta=get_meta(),
            success=BoolValue(value=False),
            message=Message(title="Error", description=result)
        )
    
    # Otherwise, it's a Secret object
    return CreateSecretResponse(
        meta=get_meta(),
        success=BoolValue(value=True),
        message=Message(title="Success", description="Secret created successfully"),
        secret=result.to_proto()
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
        # Use the CRUD manager to get the secret, including user filtering
        secret = secrets_crud_manager.get_by_id(secret_id, account.id, user.id)
        
        if not secret:
            return UpdateSecretResponse(
                meta=get_meta(),
                success=BoolValue(value=False),
                message=Message(title="Not Found", description="Secret not found or you don't have permission to update it")
            )
            
        try:
            # Use the CRUD manager to update the secret, passing account and user IDs for permission check
            updated_secret = secrets_crud_manager.update(secret, update_secret_ops, account_id=account.id, user_id=user.id)
            # Get the updated secret
            return UpdateSecretResponse(
                meta=get_meta(),
                success=BoolValue(value=True),
                message=Message(title="Success", description="Secret updated successfully"),
                secret=updated_secret.to_proto()
            )
        except Exception as e:
            logger.error(f"Error updating secret: {str(e)}")
            return UpdateSecretResponse(
                meta=get_meta(),
                success=BoolValue(value=False),
                message=Message(title="Error", description=str(e))
            )
    except Exception as e:
        logger.error(f"Error updating secret: {str(e)}")
        return UpdateSecretResponse(
            meta=get_meta(),
            success=BoolValue(value=False),
            message=Message(title="Error", description="Failed to update secret")
        )
