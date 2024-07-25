import logging

from accounts.models import Account
from connectors.assets.manager.asset_manager import ConnectorAssetManager
from connectors.assets.manager.azure_assets_manager import AzureAssetManager
from connectors.assets.manager.clickhouse_assets_manager import ClickhouseAssetManager
from connectors.assets.manager.cloudwatch_asset_manager import CloudwatchAssetManager
from connectors.assets.manager.dd_asset_manager import DatadogAssetManager
from connectors.assets.manager.eks_assets_manager import EKSAssetManager
from connectors.assets.manager.es_asset_manager import ElasticSearchAssetManager
from connectors.assets.manager.gke_asset_manager import GkeAssetManager
from connectors.assets.manager.grafana_asset_manager import GrafanaAssetManager
from connectors.assets.manager.mimir_assets_manager import MimirAssetManager
from connectors.assets.manager.nr_assets_manager import NewRelicAssetManager
from connectors.assets.manager.postgres_assets_manager import PostgresAssetManager
from connectors.assets.manager.bash_assets_manager import BashAssetManager
from connectors.assets.manager.slack_assets_manager import SlackAssetManager
from protos.connectors.assets.asset_pb2 import \
    AccountConnectorAssetsModelFilters as AccountConnectorAssetsModelFiltersProto
from protos.base_pb2 import Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto

logger = logging.getLogger(__name__)


class AssetManagerFacade:

    def __init__(self):
        self._map = {}

    def register(self, source: Source, manager: ConnectorAssetManager):
        self._map[source] = manager

    def get_asset_model_options(self, connector: ConnectorProto, model_types: [SourceModelType]):
        if not connector or not model_types:
            raise ValueError("Account, Connector and SourceModelTypes are required to fetch asset options")

        if connector.type not in self._map:
            raise ValueError(f"No asset manager found for connector_type: {connector.type}")
        manager: ConnectorAssetManager = self._map[connector.type]

        return manager.get_asset_model_options(connector=connector, model_types=model_types)

    def get_asset_model_values(self, connector: ConnectorProto, model_type: SourceModelType,
                               filters: AccountConnectorAssetsModelFiltersProto):
        if not connector:
            raise ValueError("ConnectorProto is required to fetch assets")
        manager: ConnectorAssetManager = self._map.get(connector.type)
        if not manager:
            raise ValueError(f"No asset manager found for connector_type: {connector.type}")
        assets = manager.get_asset_model_values(connector, model_type, filters)
        return [assets]


asset_manager_facade = AssetManagerFacade()
asset_manager_facade.register(Source.CLICKHOUSE, ClickhouseAssetManager())
asset_manager_facade.register(Source.CLOUDWATCH, CloudwatchAssetManager())
asset_manager_facade.register(Source.DATADOG, DatadogAssetManager())
asset_manager_facade.register(Source.EKS, EKSAssetManager())
asset_manager_facade.register(Source.GRAFANA, GrafanaAssetManager())
asset_manager_facade.register(Source.NEW_RELIC, NewRelicAssetManager())
asset_manager_facade.register(Source.POSTGRES, PostgresAssetManager())
asset_manager_facade.register(Source.SLACK, SlackAssetManager())
asset_manager_facade.register(Source.BASH, BashAssetManager())
asset_manager_facade.register(Source.GRAFANA_MIMIR, MimirAssetManager())
asset_manager_facade.register(Source.AZURE, AzureAssetManager())
asset_manager_facade.register(Source.GKE, GkeAssetManager())
asset_manager_facade.register(Source.ELASTIC_SEARCH, ElasticSearchAssetManager())
