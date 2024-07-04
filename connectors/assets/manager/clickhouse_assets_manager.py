from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.connectors.assets.asset_pb2 import \
    AccountConnectorAssetsModelFilters as AccountConnectorAssetsModelFiltersProto, ConnectorModelTypeOptions, \
    AccountConnectorAssets
from protos.connectors.assets.clickhouse_asset_pb2 import ClickhouseDatabaseAssetOptions, ClickhouseDatabaseAssetModel, \
    ClickhouseAssetModel, ClickhouseAssets
from protos.base_pb2 import Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto


class ClickhouseAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.source = Source.CLICKHOUSE
        self.asset_type_callable_map = {
            SourceModelType.CLICKHOUSE_DATABASE: {
                'options': self.get_database_options,
                'values': self.get_database_values,
            }
        }

    @staticmethod
    def get_database_options(database_assets) -> ConnectorModelTypeOptions:
        all_databases = []
        for asset in database_assets:
            all_databases.append(asset.model_uid)
        database_options = ClickhouseDatabaseAssetOptions(databases=all_databases)
        return ConnectorModelTypeOptions(model_type=SourceModelType.CLICKHOUSE_DATABASE,
                                         clickhouse_database_model_options=database_options)

    @staticmethod
    def get_database_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFiltersProto,
                            database_assets):
        which_one_of = filters.WhichOneof('filters')
        if which_one_of and which_one_of != 'clickhouse_database_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")

        options: ClickhouseDatabaseAssetOptions = filters.clickhouse_database_model_filters
        if options.databases:
            database_assets = database_assets.filter(model_uid__in=options.databases)

        assets = []
        for asset in database_assets:
            assets.append(ClickhouseAssetModel(
                id=UInt64Value(value=asset.id), connector_type=asset.connector_type,
                type=asset.model_type,
                last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                    asset.updated_at) else None,
                clickhouse_database=ClickhouseDatabaseAssetModel(database=StringValue(value=asset.model_uid))))
        return AccountConnectorAssets(clickhouse=ClickhouseAssets(assets=assets))
