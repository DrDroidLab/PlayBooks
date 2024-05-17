import logging

from accounts.models import Account
from connectors.assets.manager.asset_manager import ConnectorAssetManager
from connectors.assets.manager.clickhouse_assets_manager import ClickhouseAssetManager
from connectors.assets.manager.cloudwatch_asset_manager import CloudwatchAssetManager
from connectors.assets.manager.dd_asset_manager import DatadogAssetManager
from connectors.assets.manager.eks_assets_manager import EKSAssetManager
from connectors.assets.manager.grafana_asset_manager import GrafanaAssetManager
from connectors.assets.manager.mimir_assets_manager import MimirAssetManager
from connectors.assets.manager.nr_assets_manager import NewRelicAssetManager
from connectors.assets.manager.postgres_assets_manager import PostgresAssetManager
from connectors.assets.manager.remote_server_assets_manager import RemoteServetAssetManager
from connectors.assets.manager.slack_assets_manager import SlackAssetManager
from connectors.crud.connector_asset_model_crud import get_db_account_connector_metadata_models
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelOptions, \
    AccountConnectorAssetsModelFilters as AccountConnectorAssetsModelFiltersProto
from protos.base_pb2 import Source as ConnectorType
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto

logger = logging.getLogger(__name__)


class AssetManagerFacade:

    def __init__(self):
        self._map = {}

    def register(self, connector_type: ConnectorType,
                 manager: ConnectorAssetManager):
        self._map[connector_type] = manager

    def get_asset_model_options(self, account: Account, connector_type: ConnectorType,
                                model_type: ConnectorMetadataModelTypeProto):
        assets_options: [AccountConnectorAssetsModelOptions] = []
        connector_metadata_models = get_db_account_connector_metadata_models(account, connector_type=connector_type,
                                                                             model_type=model_type)
        models = connector_metadata_models.values_list('connector_type', 'model_type', 'model_uid', 'metadata',
                                                       named=True)
        connector_type_asset_type_model_map = {}
        for mtu in models:
            connector_type_map = connector_type_asset_type_model_map.get(mtu.connector_type, {})
            asset_type_list = connector_type_map.get(mtu.model_type, [])
            asset_type_list.append({'model_uid': mtu.model_uid, 'metadata': mtu.metadata})
            connector_type_map[mtu.model_type] = asset_type_list
            connector_type_asset_type_model_map[mtu.connector_type] = connector_type_map
        for connector_type, connector_type_map in connector_type_asset_type_model_map.items():
            model_type_options = []
            if connector_type not in self._map:
                logger.error(f'No asset manager found for connector_type: {connector_type}')
                continue
            manager: ConnectorAssetManager = self._map[connector_type]
            for model_type, asset_type_list in connector_type_map.items():
                options = manager.get_asset_model_options(model_type, asset_type_list)
                if options:
                    model_type_options.append(options)
            assets_options.append(AccountConnectorAssetsModelOptions(connector_type=connector_type,
                                                                     model_types_options=model_type_options))
        return assets_options

    def get_asset_model_values(self, account: Account, connector_type: ConnectorType,
                               model_type: ConnectorMetadataModelTypeProto,
                               filters: AccountConnectorAssetsModelFiltersProto):
        if not connector_type:
            raise ValueError(f"Missing ConnectorType in request")
        manager: ConnectorAssetManager = self._map.get(connector_type)
        if not manager:
            raise ValueError(f"No asset manager found for connector_type: {connector_type}")
        if not model_type:
            connector_metadata_models = get_db_account_connector_metadata_models(account, connector_type=connector_type)
        else:
            connector_metadata_models = get_db_account_connector_metadata_models(account, connector_type=connector_type,
                                                                                 model_type=model_type)
        assets = manager.get_asset_model_values(account, model_type, filters, connector_metadata_models)
        return [assets]


asset_manager_facade = AssetManagerFacade()
asset_manager_facade.register(ConnectorType.CLICKHOUSE, ClickhouseAssetManager())
asset_manager_facade.register(ConnectorType.CLOUDWATCH, CloudwatchAssetManager())
asset_manager_facade.register(ConnectorType.DATADOG, DatadogAssetManager())
asset_manager_facade.register(ConnectorType.EKS, EKSAssetManager())
asset_manager_facade.register(ConnectorType.GRAFANA, GrafanaAssetManager())
asset_manager_facade.register(ConnectorType.NEW_RELIC, NewRelicAssetManager())
asset_manager_facade.register(ConnectorType.POSTGRES, PostgresAssetManager())
asset_manager_facade.register(ConnectorType.SLACK, SlackAssetManager())
asset_manager_facade.register(ConnectorType.REMOTE_SERVER, RemoteServetAssetManager())
asset_manager_facade.register(ConnectorType.GRAFANA_MIMIR, MimirAssetManager())
