from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.connectors.assets.asset_pb2 import \
    AccountConnectorAssetsModelFilters as AccountConnectorAssetsModelFiltersProto, ConnectorModelTypeOptions, \
    AccountConnectorAssets
from protos.base_pb2 import Source, SourceModelType
from protos.connectors.assets.bigquery_asset_pb2 import BigQueryDatasetAssetOptions, BigQueryAssetModel, \
    BigQueryDatasetAssetModel, BigQueryAssets
from protos.connectors.connector_pb2 import Connector as ConnectorProto


class BigQueryAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.source = Source.BIGQUERY
        self.asset_type_callable_map = {
            SourceModelType.BIGQUERY_DATASET: {
                'options': self.get_dataset_options,
                'values': self.get_dataset_values,
            }
        }

    @staticmethod
    def get_dataset_options(dataset_assets) -> ConnectorModelTypeOptions:
        all_datasets = []
        for asset in dataset_assets:
            all_datasets.append(asset.model_uid)
        dataset_options = BigQueryDatasetAssetOptions(datasets=all_datasets)
        return ConnectorModelTypeOptions(model_type=SourceModelType.BIGQUERY_DATASET,
                                         bigquery_dataset_model_options=dataset_options)

    @staticmethod
    def get_dataset_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFiltersProto,
                           dataset_assets):
        which_one_of = filters.WhichOneof('filters')
        if which_one_of and which_one_of != 'bigquery_dataset_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")

        options: BigQueryDatasetAssetOptions = filters.bigquery_dataset_model_filters
        if options.datasets:
            dataset_assets = dataset_assets.filter(model_uid__in=options.datasets)

        assets = []
        for asset in dataset_assets:
            assets.append(BigQueryAssetModel(
                id=UInt64Value(value=asset.id), connector_type=asset.connector_type,
                type=asset.model_type,
                last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                    asset.updated_at) else None,
                bigquery_dataset=BigQueryDatasetAssetModel(dataset=StringValue(value=asset.model_uid))))
        return AccountConnectorAssets(bigquery=BigQueryAssets(assets=assets))