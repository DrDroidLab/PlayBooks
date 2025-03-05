import logging

from executor.models import Secret
from protos.secrets.api_pb2 import UpdateSecretOp
from utils.update_processor_mixin import UpdateProcessorMixin

logger = logging.getLogger(__name__)


class SecretsUpdateProcessor(UpdateProcessorMixin):
    update_op_cls = UpdateSecretOp

    @staticmethod
    def update_secret(elem: Secret, update_op: UpdateSecretOp.UpdateSecret) -> Secret:
        """Update a secret's description and/or value"""
        update_fields = ['updated_at']
        
        # Update description if provided and has a value
        if hasattr(update_op, 'description') and update_op.description.value:
            elem.description = update_op.description.value
            update_fields.append('description')
            
        # Update value if provided and has a value
        if hasattr(update_op, 'value') and update_op.value.value:
            elem.value = update_op.value.value
            update_fields.append('value')
        
        logger.info(f"Updating secret {elem.key} with fields: {update_fields}, {len(update_fields)}")
        if len(update_fields) > 1:  # Only save if we have fields to update
            try:
                elem.save(update_fields=update_fields)
            except Exception as ex:
                logger.exception(f"Error occurred updating secret {elem.key}")
                raise Exception(f"Error updating secret: {str(ex)}")
                
        return elem

    @staticmethod
    def update_secret_status(elem: Secret, update_op: UpdateSecretOp.UpdateSecretStatus) -> Secret:
        """Update a secret's active status (soft delete)"""
        is_active = update_op.is_active.value
        
        # Can't reactivate a secret that's been deactivated
        if not elem.is_active and is_active:
            raise Exception(f"Secret {elem.key} cannot be reactivated")
            
        # No change needed
        if elem.is_active == is_active:
            return elem
            
        elem.is_active = is_active
        try:
            elem.save(update_fields=['is_active', 'updated_at'])
        except Exception as ex:
            logger.exception(f"Error occurred updating secret status for {elem.key}")
            raise Exception(f"Error updating secret status: {str(ex)}")
        return elem


secrets_update_processor = SecretsUpdateProcessor()
