import logging
from datetime import datetime, date

from connectors.models import ConnectorMetadataModelStore
from protos.base_pb2 import Source
from utils.logging_utils import log_function_call

logger = logging.getLogger(__name__)


class SourceMetadataExtractor:

    def __init__(self, account_id=None, connector_id=None, source=Source.UNKNOWN):
        self.account_id = account_id
        self.connector_id = connector_id
        self.source = source

    @log_function_call
    def create_or_update_model_metadata(self, model_type, model_uid, metadata):
        try:
            if not self.account_id or not self.connector_id or not self.source:
                logger.error(f'Aborting metadata creation or update for model_type: {model_type}, model_uid: '
                             f'{model_uid}. Account ID, Connector ID and Connector Type are required')
                return
            for k, v in metadata.items():
                if isinstance(v, (datetime, date)):
                    metadata[k] = v.isoformat()
            ConnectorMetadataModelStore.objects.update_or_create(
                account_id=self.account_id, connector_id=self.connector_id, connector_type=self.source,
                model_type=model_type, model_uid=model_uid,
                defaults={'metadata': metadata, 'is_active': True}
            )
        except Exception as e:
            logger.error(f'Error creating or updating model_type: {model_type}, model_uid: {model_uid}: {e}')
