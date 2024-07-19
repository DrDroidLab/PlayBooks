from datetime import timezone
from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.connectors.assets.asset_pb2 import \
    AccountConnectorAssetsModelFilters as AccountConnectorAssetsModelFiltersProto, AccountConnectorAssets, \
    ConnectorModelTypeOptions
from protos.connectors.assets.gcm_asset_pb2 import GcmMetricAssetOptions, \
    GcmAssets, GcmMetricAssetModel as GcmMetricAssetProto, \
    GcmAssetModel as GcmAssetModelProto
from protos.base_pb2 import Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto


class GcmAssetManager(ConnectorAssetManager):
    def __init__(self):
        self.source = Source.GCM
        self.asset_type_callable_map = {
            SourceModelType.GCM_METRIC: {
                'options': self.get_gcm_metric_options,
                'values': self.get_gcm_metric_values,
            }
        }

    @staticmethod
    def get_gcm_metric_options(gcm_metric_assets):
        all_metric_types = []
        for asset in gcm_metric_assets:
            if isinstance(asset.model_uid, str):
                all_metric_types.append(asset.model_uid)
        options = GcmMetricAssetOptions(metric_types=all_metric_types)
        return ConnectorModelTypeOptions(model_type=SourceModelType.GCM_METRIC,
                                         gcm_metric_model_options=options)

    @staticmethod
    def get_gcm_metric_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFiltersProto,
                              gcm_metric_assets):
        which_one_of = filters.WhichOneof('filters')
        if which_one_of and which_one_of != 'gcm_metric_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")

        options: GcmMetricAssetOptions = filters.gcm_metric_model_filters
        if options.metric_types:
            gcm_metric_assets = gcm_metric_assets.filter(model_uid__in=options.metric_types)

        gcm_metric_asset_protos = []
        for asset in gcm_metric_assets:
            gcm_metric_proto = GcmMetricAssetProto(metric_type=StringValue(value=asset.model_uid))
            gcm_metric_asset_protos.append(GcmAssetModelProto(
                id=UInt64Value(value=asset.id),
                connector_type=asset.connector_type,
                type=asset.model_type,
                last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                    asset.updated_at) else None,
                gcm_metric=gcm_metric_proto))

        return AccountConnectorAssets(gcm=GcmAssets(assets=gcm_metric_asset_protos))



