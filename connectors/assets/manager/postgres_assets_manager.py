from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from accounts.models import Account
from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.connectors.assets.postgres_asset_pb2 import PostgresDatabaseAssetOptions, PostgresDatabaseAssetModel, \
    PostgresAssetModel, PostgresAssets
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelFilters, AccountConnectorAssetsModelOptions, \
    AccountConnectorAssets
from protos.base_pb2 import Source as ConnectorType
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto


class PostgresAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.connector_type = ConnectorType.POSTGRES

    def get_asset_model_options(self, model_type: ConnectorMetadataModelTypeProto, model_uid_metadata_list):
        if model_type == ConnectorMetadataModelTypeProto.POSTGRES_DATABASE:
            all_databases = []
            for item in model_uid_metadata_list:
                all_databases.append(item['model_uid'])
            options = PostgresDatabaseAssetOptions(databases=all_databases)
            return AccountConnectorAssetsModelOptions.ModelTypeOption(model_type=model_type,
                                                                      postgres_database_model_options=options)
        else:
            return None

    def get_asset_model_values(self, account: Account, model_type: ConnectorMetadataModelTypeProto,
                               filters: AccountConnectorAssetsModelFilters, pg_models):
        which_one_of = filters.WhichOneof('filters')
        if model_type == ConnectorMetadataModelTypeProto.POSTGRES_DATABASE and (
                not which_one_of or which_one_of == 'postgres_database_model_filters'):
            options: PostgresDatabaseAssetOptions = filters.postgres_database_model_filters
            filter_databases = options.databases
            pg_models = pg_models.filter(model_type=ConnectorMetadataModelTypeProto.POSTGRES_DATABASE)
            if filter_databases:
                pg_models = pg_models.filter(model_uid__in=filter_databases)
        postgres_asset_protos = []
        for asset in pg_models:
            if asset.model_type == ConnectorMetadataModelTypeProto.POSTGRES_DATABASE:
                postgres_asset_protos.append(PostgresAssetModel(
                    id=UInt64Value(value=asset.id), connector_type=asset.connector_type,
                    type=asset.model_type,
                    last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                        asset.updated_at) else None,
                    postgres_database=PostgresDatabaseAssetModel(database=StringValue(value=asset.model_uid))))
        return AccountConnectorAssets(postgres=PostgresAssets(assets=postgres_asset_protos))
