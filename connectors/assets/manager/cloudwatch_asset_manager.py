from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.connectors.assets.asset_pb2 import \
    AccountConnectorAssetsModelFilters as AccountConnectorAssetsModelFiltersProto, AccountConnectorAssets, \
    ConnectorModelTypeOptions
from protos.connectors.assets.cloudwatch_asset_pb2 import CloudwatchLogGroupAssetOptions, CloudwatchMetricAssetOptions, \
    CloudwatchAssets, CloudwatchMetricAssetModel as CloudwatchMetricAssetProto, \
    CloudwatchAssetModel as CloudwatchAssetModelProto, CloudwatchLogGroupAssetModel as CloudwatchLogGroupAssetModelProto
from protos.base_pb2 import Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto


class CloudwatchAssetManager(ConnectorAssetManager):
    def __init__(self):
        self.source = Source.CLOUDWATCH
        self.asset_type_callable_map = {
            SourceModelType.CLOUDWATCH_LOG_GROUP: {
                'options': self.get_cw_log_group_options,
                'values': self.get_cw_log_group_values,
            },
            SourceModelType.CLOUDWATCH_METRIC: {
                'options': self.get_cw_metric_options,
                'values': self.get_cw_metric_values,
            }
        }

    @staticmethod
    def get_cw_log_group_options(cw_log_group_assets):
        all_regions = []
        for asset in cw_log_group_assets:
            all_regions.append(asset.model_uid)
        options = CloudwatchLogGroupAssetOptions(regions=all_regions)
        return ConnectorModelTypeOptions(model_type=SourceModelType.CLOUDWATCH_LOG_GROUP,
                                         cloudwatch_log_group_model_options=options)

    @staticmethod
    def get_cw_log_group_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFiltersProto,
                                cw_log_group_assets):

        which_one_of = filters.WhichOneof('filters')
        if which_one_of and which_one_of != 'cloudwatch_log_group_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")

        options: CloudwatchLogGroupAssetOptions = filters.cloudwatch_log_group_model_filters
        if options.regions:
            cw_log_group_assets = cw_log_group_assets.filter(model_uid__in=options.regions)

        cw_log_group_protos = []
        for asset in cw_log_group_assets:
            for region, log_groups in asset.metadata.items():
                cw_log_group_protos.append(CloudwatchAssetModelProto(
                    id=UInt64Value(value=asset.id), connector_type=asset.connector_type,
                    type=asset.model_type,
                    last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                        asset.updated_at) else None,
                    cloudwatch_log_group=CloudwatchLogGroupAssetModelProto(
                        region=StringValue(value=asset.model_uid),
                        log_groups=log_groups)
                ))

        return AccountConnectorAssets(connector=connector, cloudwatch=CloudwatchAssets(assets=cw_log_group_protos))

    @staticmethod
    def get_cw_metric_options(cw_metric_assets):
        all_namespaces = []
        for asset in cw_metric_assets:
            all_namespaces.append(asset.model_uid)
        options = CloudwatchMetricAssetOptions(namespaces=all_namespaces)
        return ConnectorModelTypeOptions(model_type=SourceModelType.CLOUDWATCH_METRIC,
                                         cloudwatch_metric_model_options=options)

    @staticmethod
    def get_cw_metric_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFiltersProto,
                             cw_metric_assets):
        which_one_of = filters.WhichOneof('filters')
        if which_one_of and which_one_of != 'cloudwatch_metric_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")

        options: CloudwatchMetricAssetOptions = filters.cloudwatch_metric_model_filters
        if options.namespaces:
            cw_metric_assets = cw_metric_assets.filter(model_uid__in=options.namespaces)

        cw_metric_asset_protos = []
        for asset in cw_metric_assets:
            all_metrics = []
            all_region_dimension_map: [CloudwatchMetricAssetProto.RegionDimensionMap] = []
            for region, metric_dict in asset.metadata.items():
                all_dimension_value_metric_map = {}
                for metric, dimension_dict in metric_dict.items():
                    dimensions = dimension_dict['Dimensions']
                    for dn, dn_values in dimensions.items():
                        all_dimension_value_metric_dict = all_dimension_value_metric_map.get(dn, {})
                        all_dimension_value_metric_dict_values = all_dimension_value_metric_dict.get('values', [])
                        all_dimension_value_metric_dict_values.extend(dn_values)
                        all_dimension_value_metric_dict['values'] = list(
                            set(all_dimension_value_metric_dict_values))

                        all_dimension_value_metric_dict_metrics = all_dimension_value_metric_dict.get('metrics', [])
                        all_dimension_value_metric_dict_metrics.append(metric)
                        all_dimension_value_metric_dict['metrics'] = list(
                            set(all_dimension_value_metric_dict_metrics))

                        all_dimension_value_metric_map[dn] = all_dimension_value_metric_dict

                for dn, dn_values_metrics in all_dimension_value_metric_map.items():
                    all_metrics.append(CloudwatchMetricAssetProto.MetricDimension(name=StringValue(value=dn),
                                                                                  values=dn_values_metrics[
                                                                                      'values'],
                                                                                  metrics=dn_values_metrics[
                                                                                      'metrics']))
                all_region_dimension_map.append(CloudwatchMetricAssetProto.RegionDimensionMap(
                    region=StringValue(value=region), dimensions=all_metrics))
            cloudwatch_metric_proto = CloudwatchMetricAssetProto(namespace=StringValue(value=asset.model_uid),
                                                                 region_dimension_map=all_region_dimension_map)
            cw_metric_asset_protos.append(CloudwatchAssetModelProto(
                id=UInt64Value(value=asset.id), connector_type=asset.connector_type,
                type=asset.model_type,
                last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                    asset.updated_at) else None,
                cloudwatch_metric=cloudwatch_metric_proto))

        return AccountConnectorAssets(connector=connector, cloudwatch=CloudwatchAssets(assets=cw_metric_asset_protos))
