import logging
from typing import List, Optional, Union
from datetime import timezone
import uuid

from django.db.models import QuerySet
from google.protobuf.wrappers_pb2 import BoolValue, StringValue

from executor.models import Secret
from protos.secrets.api_pb2 import UpdateSecretOp, Secret as SecretProto
from protos.base_pb2 import Message, Meta, Page
from utils.update_processor_mixin import UpdateProcessorMixin

logger = logging.getLogger(__name__)


class SecretsCrudManager(UpdateProcessorMixin):
    """
    Centralized manager for all CRUD operations on Secrets
    """
    update_op_cls = UpdateSecretOp

    @staticmethod
    def get_by_id(secret_id: str, account_id: int, user_id: int = None) -> Optional[Secret]:
        """
        Get a secret by ID
        
        Args:
            secret_id: The ID of the secret to retrieve
            account_id: The account ID the secret belongs to
            user_id: If provided, only return secrets created by this user
            
        Returns:
            Secret object if found, None otherwise
        """
        try:
            query = {
                'id': secret_id,
                'account_id': account_id,
                'is_active': True
            }
            
            # Add user filter if provided
            if user_id:
                query['created_by_id'] = user_id
                
            return Secret.objects.get(**query)
        except Secret.DoesNotExist:
            return None

    @staticmethod
    def list_secrets(account_id: int, user_id: int = None, secret_ids: List[str] = None, 
                    key_filter: str = None, show_inactive: bool = False,
                    page: Page = None) -> QuerySet:
        """
        List secrets with optional filtering
        
        Args:
            account_id: The account ID to filter secrets by
            user_id: If provided, only return secrets created by this user
            secret_ids: Optional list of secret IDs to filter by
            key_filter: Optional key substring to filter by
            show_inactive: Whether to include inactive secrets
            page: Pagination information
            
        Returns:
            QuerySet of Secret objects
        """
        # Base queryset
        qs = Secret.objects.filter(account_id=account_id)
        
        # Filtering as per options
        if user_id:
            qs = qs.filter(created_by_id=user_id)

        if secret_ids:
            qs = qs.filter(id__in=secret_ids)

        elif key_filter:
            qs = qs.filter(key__icontains=key_filter.lower())

        elif not show_inactive:
            qs = qs.filter(is_active=True)
            
        return qs.order_by('-created_at')

    @staticmethod
    def create_secret(account_id: int, key: str, value: str, 
                     description: str, user) -> Union[Secret, str]:
        """
        Create a new secret
        
        Args:
            account_id: The account ID to create the secret under
            key: The key for the secret
            value: The value of the secret
            description: Optional description for the secret
            user: The user creating the secret
            
        Returns:
            Secret object if successful, error message string if failed
        """
        # Validate required fields
        if not key or not value:
            return "Key and value are required"

        if not key.isalnum() and not '_' in key:
            return "Key must contain only letters, numbers, and underscores"
        
        if Secret.objects.filter(account_id=account_id, key=key, is_active=True).exists():
            return f"A secret with key '{key}' already exists"
        
        # Create the secret
        try:
            secret = Secret.objects.create(
                account_id=account_id,
                key=key,
                value=value,
                description=description,
                created_by=user,
                is_active=True
            )
            return secret
        except Exception as ex:
            logger.exception(f"Error creating secret with key {key}")
            return f"Failed to create secret: {str(ex)}"

    @staticmethod
    def verify_ownership(secret: Secret, account_id: int, user_id: int) -> bool:
        """
        Verify that the secret belongs to the specified account and user
        
        Args:
            secret: The secret to verify
            account_id: The account ID to check against
            user_id: The user ID to check against
            
        Returns:
            True if the secret belongs to the account and user, False otherwise
        """
        return (secret.account_id == account_id and 
                secret.created_by_id == user_id and 
                secret.is_active)

    @staticmethod
    def update_secret(elem: Secret, update_op: UpdateSecretOp.UpdateSecret, account_id: int, user_id: int) -> Secret:
        """
        Update a secret's description and/or value
        
        Args:
            elem: The secret to update
            update_op: The update operation to apply
            account_id: If provided, verify the secret belongs to this account
            user_id: If provided, verify the secret was created by this user
            
        Returns:
            The updated secret
            
        Raises:
            Exception: If the update fails or the user doesn't have permission
        """
        # Verify ownership if account_id and user_id are provided
        if not SecretsCrudManager.verify_ownership(elem, account_id, user_id):
            raise Exception(f"You don't have permission to update secret {elem.key}")
        
        update_fields = ['updated_at']
        
        # Update description if provided and has a value
        if update_op.HasField('description') and update_op.description.value:
            elem.description = update_op.description.value
            update_fields.append('description')
            
        # Update value if provided and has a value
        if update_op.HasField('value') and update_op.value.value:
            elem.value = update_op.value.value
            update_fields.append('value')
        
        if len(update_fields) > 1:  # Only save if we have fields to update
            try:
                elem.save(update_fields=update_fields)
            except Exception as ex:
                logger.exception(f"Error occurred updating secret {elem.key}")
                raise Exception(f"Error updating secret: {str(ex)}")

        return elem

    @staticmethod
    def update_secret_status(elem: Secret, update_op: UpdateSecretOp.UpdateSecretStatus, account_id: int, user_id: int) -> Secret:
        """
        Update a secret's active status (soft delete)
        
        When deactivating a secret, the key is modified to prevent conflicts
        with future secrets using the same key
        
        Args:
            elem: The secret to update
            update_op: The update operation to apply
            account_id: If provided, verify the secret belongs to this account
            user_id: If provided, verify the secret was created by this user
            
        Returns:
            The updated secret
            
        Raises:
            Exception: If the update fails or the user doesn't have permission
        """
        # Verify ownership if account_id and user_id are provided
        if not SecretsCrudManager.verify_ownership(elem, account_id, user_id):
            raise Exception(f"You don't have permission to deactivate secret {elem.key}")

        is_active = update_op.is_active.value

        # We only support deactivation, not reactivation
        if is_active or not elem.is_active:
            raise Exception(f"Secret {elem.key} cannot be reactivated once deactivated")
            
        # Use the deactivate method to handle the key modification
        if not elem.deactivate():
            raise Exception(f"Secret {elem.key} is already inactive")

        return elem

    def update(self, elem: Secret, update_ops, account_id: int, user_id: int):
        """
        Apply a list of update operations to a secret
        
        Args:
            elem: The secret to update
            update_ops: The list of update operations to apply
            account_id: If provided, verify the secret belongs to this account
            user_id: If provided, verify the secret was created by this user
            
        Returns:
            The updated secret
            
        Raises:
            Exception: If any update fails or the user doesn't have permission
        """
        if not self.verify_ownership(elem, account_id, user_id):
            raise Exception(f"You don't have permission to update secret {elem.key}")
        # Apply each update operation
        for update_op in update_ops:
            if update_op.HasField('update_secret'):
                elem = self.update_secret(elem, update_op.update_secret, account_id, user_id)
            elif update_op.HasField('update_secret_status'):
                elem = self.update_secret_status(elem, update_op.update_secret_status, account_id, user_id)
        return elem


secrets_crud_manager = SecretsCrudManager()
