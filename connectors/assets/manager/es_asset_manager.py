from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.connectors.assets.asset_pb2 import \
    AccountConnectorAssetsModelFilters as AccountConnectorAssetsModelFiltersProto, ConnectorModelTypeOptions, \
    AccountConnectorAssets
from protos.base_pb2 import Source, SourceModelType
from protos.connectors.assets.elastic_search_asset_pb2 import ElasticSearchIndexAssetOptions, ElasticSearchAssetModel, \
    ElasticSearchIndexAssetModel, ElasticSearchAssets
from protos.connectors.connector_pb2 import Connector as ConnectorProto


class ElasticSearchAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.source = Source.ELASTIC_SEARCH
        self.asset_type_callable_map = {
            SourceModelType.ELASTIC_SEARCH_INDEX: {
                'options': self.get_index_options,
                'values': self.get_index_values,
            }
        }

    @staticmethod
    def get_index_options(index_assets) -> ConnectorModelTypeOptions:
        all_indexes = []
        for asset in index_assets:
            all_indexes.append(asset.model_uid)
        index_options = ElasticSearchIndexAssetOptions(indexes=all_indexes)
        return ConnectorModelTypeOptions(model_type=SourceModelType.ELASTIC_SEARCH_INDEX,
                                         elastic_search_index_model_options=index_options)

    @staticmethod
    def get_index_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFiltersProto,
                         index_assets):
        which_one_of = filters.WhichOneof('filters')
        if which_one_of and which_one_of != 'elastic_search_index_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")

        options: ElasticSearchIndexAssetOptions = filters.elastic_search_index_model_filters
        if options.indexes:
            index_assets = index_assets.filter(model_uid__in=options.indexes)

        assets = []
        for asset in index_assets:
            assets.append(ElasticSearchAssetModel(
                id=UInt64Value(value=asset.id), connector_type=asset.connector_type,
                type=asset.model_type,
                last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                    asset.updated_at) else None,
                elastic_search_index=ElasticSearchIndexAssetModel(index=StringValue(value=asset.model_uid))))
        return AccountConnectorAssets(elastic_search=ElasticSearchAssets(assets=assets))
