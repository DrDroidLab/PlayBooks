from datetime import timezone

from django.db.models import Q
from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from accounts.models import Account
from connectors.assets.manager.asset_manager import ConnectorAssetManager
from connectors.crud.connector_asset_model_crud import get_db_account_connector_metadata_models
from protos.connectors.assets.grafana_asset_pb2 import GrafanaTargetMetricPromQlAssetOptions, \
    GrafanaAssetModel as GrafanaAssetModelProto, GrafanaTargetMetricPromQlAssetModel, GrafanaAssets
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelFilters, AccountConnectorAssetsModelOptions, \
    AccountConnectorAssets
from protos.connectors.connector_pb2 import ConnectorMetadataModelType, ConnectorType


class MimirAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.connector_type = ConnectorType.GRAFANA_MIMIR
