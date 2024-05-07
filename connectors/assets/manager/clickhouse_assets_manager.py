from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from accounts.models import Account
from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.connectors.assets.asset_pb2 import \
    AccountConnectorAssetsModelFilters as AccountConnectorAssetsModelFiltersProto, AccountConnectorAssetsModelOptions, \
    AccountConnectorAssets
from protos.connectors.assets.clickhouse_asset_pb2 import ClickhouseDatabaseAssetOptions, ClickhouseDatabaseAssetModel, \
    ClickhouseAssetModel, ClickhouseAssets
from protos.connectors.connector_pb2 import ConnectorType as ConnectorTypeProto, \
    ConnectorMetadataModelType as ConnectorMetadataModelTypeProto


class ClickhouseAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.connector_type = ConnectorTypeProto.CLICKHOUSE

    def get_asset_model_options(self, model_type: ConnectorMetadataModelTypeProto, model_uid_metadata_list):
        if model_type == ConnectorMetadataModelTypeProto.CLICKHOUSE_DATABASE:
            all_databases = []
            for item in model_uid_metadata_list:
                all_databases.append(item['model_uid'])
            options = ClickhouseDatabaseAssetOptions(databases=all_databases)
            return AccountConnectorAssetsModelOptions.ModelTypeOption(model_type=model_type,
                                                                      clickhouse_database_model_options=options)
        else:
            return None

    def get_asset_model_values(self, account: Account, model_type: ConnectorMetadataModelTypeProto,
                               filters: AccountConnectorAssetsModelFiltersProto, clickhouse_models):
        which_one_of = filters.WhichOneof('filters')
        if model_type == ConnectorMetadataModelTypeProto.CLICKHOUSE_DATABASE and (
                not which_one_of or which_one_of == 'clickhouse_database_model_filters'):
            options: ClickhouseDatabaseAssetOptions = filters.clickhouse_database_model_filters
            filter_databases = options.databases
            clickhouse_models = clickhouse_models.filter(model_type=ConnectorMetadataModelTypeProto.CLICKHOUSE_DATABASE)
            if filter_databases:
                clickhouse_models = clickhouse_models.filter(model_uid__in=filter_databases)
        clickhouse_asset_protos = []
        for asset in clickhouse_models:
            if asset.model_type == ConnectorMetadataModelTypeProto.CLICKHOUSE_DATABASE:
                clickhouse_asset_protos.append(ClickhouseAssetModel(
                    id=UInt64Value(value=asset.id), connector_type=asset.connector_type,
                    type=asset.model_type,
                    last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                        asset.updated_at) else None,
                    clickhouse_database=ClickhouseDatabaseAssetModel(database=StringValue(value=asset.model_uid))))
        return AccountConnectorAssets(clickhouse=ClickhouseAssets(assets=clickhouse_asset_protos))
