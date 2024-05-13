import logging

from accounts.models import Account
from connectors.models import ConnectorMetadataModelStore
from protos.base_pb2 import Source as ConnectorTypeProto
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto

logger = logging.getLogger(__name__)


class ConnectorAssetModelCrudException(ValueError):
    pass


def get_db_account_connector_metadata_models(account: Account, model_uid: str = None,
                                             connector_type: ConnectorTypeProto = None,
                                             model_type: ConnectorMetadataModelTypeProto = None, model_types=None,
                                             is_active=True):
    filters = {}
    if connector_type:
        filters['connector_type'] = connector_type
    if model_type:
        filters['model_type'] = model_type
    if model_types:
        filters['model_type__in'] = model_types
    if is_active is not None:
        filters['is_active'] = is_active
    if model_uid:
        filters['model_uid'] = model_uid
    try:
        return account.connectormetadatamodelstore_set.filter(**filters)
    except Exception as e:
        logger.error(f"Error fetching Connector Models: {str(e)}")
    return None


def get_db_connector_metadata_models(account_id=None, connector_id=None, connector_type: ConnectorTypeProto = None,
                                     model_type: ConnectorMetadataModelTypeProto = None, model_uid: str = None,
                                     model_types=None, is_active=True):
    filters = {}
    if account_id:
        filters['account_id'] = account_id
    if connector_id:
        filters['connector_id'] = connector_id
    if connector_type:
        filters['connector_type'] = connector_type
    if model_type:
        filters['model_type'] = model_type
    if model_types:
        filters['model_type__in'] = model_types
    if is_active is not None:
        filters['is_active'] = is_active
    if model_uid:
        filters['model_uid'] = model_uid
    try:
        return ConnectorMetadataModelStore.objects.filter(**filters)
    except Exception as e:
        logger.error(f"Error fetching Connector Models: {str(e)}")
    return None


def create_or_update_model_metadata(account_id, connector_id, connector_type: ConnectorTypeProto,
                                    model_type: ConnectorMetadataModelTypeProto, model_uid: str, is_active=True,
                                    metadata=None):
    try:
        model, is_created = ConnectorMetadataModelStore.objects.update_or_create(account_id=account_id,
                                                                                 connector_id=connector_id,
                                                                                 connector_type=connector_type,
                                                                                 model_type=model_type,
                                                                                 model_uid=model_uid,
                                                                                 defaults={'metadata': metadata,
                                                                                           'is_active': is_active})
        return model, is_created
    except Exception as e:
        logger.error(
            f"Error while saving Metadata: {connector_id}:{model_uid} with error: {e}")
    return None, False
