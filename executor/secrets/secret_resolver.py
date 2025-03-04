import re
import logging
from typing import Dict, Set
from protos.ui_definition_pb2 import FormField
from protos.literal_pb2 import LiteralType
from executor.models import Secret

logger = logging.getLogger(__name__)

class SecretResolver:
    SECRET_PATTERN = r'!([\w-]+)'

    @classmethod
    def extract_secret_refs(cls, value: str) -> Set[str]:
        """Extract secret references from a string value"""
        return set(re.findall(cls.SECRET_PATTERN, str(value)))

    @classmethod
    def replace_secret_refs(cls, value: str, secret_map: Dict[str, str]) -> str:
        """Replace secret references with their values"""
        result = str(value)
        for secret_key, secret_value in secret_map.items():
            result = result.replace(f"!{secret_key}", secret_value)
        return result

    @classmethod
    def resolve_secrets(cls, form_fields: [FormField], account_id: int, source_type_task_def: Dict) -> Dict:
        """
        Resolves secret references (prefixed with !) in task definition

        Args:
            form_fields: List of form fields defining the task structure
            account_id: ID of the account owning the secrets
            source_type_task_def: Task definition dictionary to resolve secrets in

        Returns:
            Dict with secrets resolved
        """
        try:
            # Get fields that might contain secrets
            string_fields = [ff.key_name.value for ff in form_fields if ff.data_type == LiteralType.STRING]
            string_array_fields = [ff.key_name.value for ff in form_fields if ff.data_type == LiteralType.STRING_ARRAY]

            # Collect all secret references
            secret_refs = set()
            for field_name, value in source_type_task_def.items():
                if field_name in string_fields:
                    secret_refs.update(cls.extract_secret_refs(value))
                elif field_name in string_array_fields:
                    for item in value:
                        secret_refs.update(cls.extract_secret_refs(item))

            if not secret_refs:
                return source_type_task_def

            # Get referenced secrets from DB
            secrets = Secret.objects.filter(
                account_id=account_id,
                is_active=True,
                key__in=secret_refs
            ).values('key', 'value')

            if not secrets:
                logger.warning(f"No secrets found for references: {secret_refs}")
                return source_type_task_def

            # Create mapping of secret keys to values
            secret_map = {s['key']: s['value'] for s in secrets}

            # Replace secret references with values
            resolved_def = source_type_task_def.copy()
            for field_name, value in source_type_task_def.items():
                if field_name in string_fields:
                    resolved_def[field_name] = cls.replace_secret_refs(value, secret_map)
                elif field_name in string_array_fields:
                    resolved_def[field_name] = [
                        cls.replace_secret_refs(item, secret_map) 
                        for item in value
                    ]

            return resolved_def

        except Exception as e:
            logger.error(f"Error resolving secrets: {str(e)}")
            return source_type_task_def 