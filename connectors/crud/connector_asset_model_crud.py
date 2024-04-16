import logging

from accounts.models import Account
from protos.connectors.connector_pb2 import ConnectorType as ConnectorTypeProto, \
    ConnectorMetadataModelType as ConnectorMetadataModelTypeProto

logger = logging.getLogger(__name__)


class ConnectorAssetModelCrudException(ValueError):
    pass


def get_connector_metadata_models(account: Account, connector_type: ConnectorTypeProto = None,
                                  model_type: ConnectorMetadataModelTypeProto = None, is_active=True):
    filters = {}
    if connector_type:
        filters['connector_type'] = connector_type
    if model_type:
        filters['model_type'] = model_type
    if is_active is not None:
        filters['is_active'] = is_active
    try:
        return account.connectormetadatamodelstore_set.filter(**filters)
    except Exception as e:
        logger.error(f"Error fetching Connector Keys: {str(e)}")
    return None
