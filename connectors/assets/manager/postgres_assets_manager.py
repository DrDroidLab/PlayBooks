from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.connectors.assets.postgres_asset_pb2 import PostgresDatabaseAssetOptions, PostgresDatabaseAssetModel, \
    PostgresAssetModel, PostgresAssets
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelFilters, AccountConnectorAssets, \
    ConnectorModelTypeOptions
from protos.base_pb2 import Source, SourceModelType as SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto


class PostgresAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.connector_type = Source.POSTGRES
        self.asset_type_callable_map = {
            SourceModelType.POSTGRES_QUERY: {
                'options': self.get_pg_db_asset_options,
                'values': self.get_pg_db_asset_values,
            }
        }

    @staticmethod
    def get_pg_db_asset_options(pg_db_assets):
        all_databases = []
        for asset in pg_db_assets:
            all_databases.append(asset.model_uid)
        options = PostgresDatabaseAssetOptions(databases=all_databases)
        return ConnectorModelTypeOptions(model_type=SourceModelType.POSTGRES_QUERY,
                                         postgres_database_model_options=options)

    @staticmethod
    def get_pg_db_asset_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFilters, pg_db_assets):
        which_one_of = filters.WhichOneof('filters')
        if which_one_of and which_one_of != 'postgres_database_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")
        options: PostgresDatabaseAssetOptions = filters.postgres_database_model_filters
        filter_databases = options.databases
        if filter_databases:
            pg_db_assets = pg_db_assets.filter(model_uid__in=filter_databases)
        postgres_asset_protos = []
        for asset in pg_db_assets:
            if asset.model_type == SourceModelType.POSTGRES_QUERY:
                postgres_asset_protos.append(PostgresAssetModel(
                    id=UInt64Value(value=asset.id), connector_type=asset.connector_type,
                    type=asset.model_type,
                    last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                        asset.updated_at) else None,
                    postgres_database=PostgresDatabaseAssetModel(database=StringValue(value=asset.model_uid))))
        return AccountConnectorAssets(postgres=PostgresAssets(assets=postgres_asset_protos))
