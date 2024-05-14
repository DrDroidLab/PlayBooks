import logging
from datetime import datetime, date

from connectors.models import ConnectorMetadataModelStore
from protos.base_pb2 import Source as ConnectorType

logger = logging.getLogger(__name__)


class ConnectorMetadataExtractor:

    def __init__(self, account_id=None, connector_id=None, connector_type=ConnectorType.UNKNOWN):
        self.account_id = account_id
        self.connector_id = connector_id
        self.connector_type = connector_type

    def create_or_update_model_metadata(self, model_type, model_uid, metadata):
        try:
            if not self.account_id or not self.connector_id or not self.connector_type:
                logger.error(f'Aborting metadata creation or update for model_type: {model_type}, model_uid: '
                             f'{model_uid}. Account ID, Connector ID and Connector Type are required')
                return
            for k, v in metadata.items():
                if isinstance(v, (datetime, date)):
                    metadata[k] = v.isoformat()
            ConnectorMetadataModelStore.objects.update_or_create(
                account_id=self.account_id, connector_id=self.connector_id, connector_type=self.connector_type,
                model_type=model_type, model_uid=model_uid,
                defaults={'metadata': metadata, 'is_active': True}
            )
        except Exception as e:
            logger.error(f'Error creating or updating model_type: {model_type}, model_uid: {model_uid}: {e}')
