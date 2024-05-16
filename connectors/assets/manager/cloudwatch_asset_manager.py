from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from accounts.models import Account
from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelOptions, \
    AccountConnectorAssetsModelFilters as AccountConnectorAssetsModelFiltersProto, AccountConnectorAssets, \
    ConnectorModelTypeOptions
from protos.connectors.assets.cloudwatch_asset_pb2 import CloudwatchLogGroupAssetOptions, CloudwatchMetricAssetOptions, \
    CloudwatchAssets, CloudwatchMetricAssetModel as CloudwatchMetricAssetProto, \
    CloudwatchAssetModel as CloudwatchAssetModelProto, CloudwatchLogGroupAssetModel as CloudwatchLogGroupAssetModelProto
from protos.base_pb2 import Source as ConnectorType
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto


class CloudwatchAssetManager(ConnectorAssetManager):
    def __init__(self):
        self.connector_type = ConnectorType.CLICKHOUSE

    def get_asset_model_options(self, model_type: ConnectorMetadataModelTypeProto, model_uid_metadata_list):
        if model_type == ConnectorMetadataModelTypeProto.CLOUDWATCH_LOG_GROUP:
            all_regions = []
            for item in model_uid_metadata_list:
                all_regions.append(item['model_uid'])
            options = CloudwatchLogGroupAssetOptions(regions=all_regions)
            return ConnectorModelTypeOptions(model_type=model_type, cloudwatch_log_group_model_options=options)
        elif model_type == ConnectorMetadataModelTypeProto.CLOUDWATCH_METRIC:
            all_namespaces = []
            for item in model_uid_metadata_list:
                all_namespaces.append(item['model_uid'])
            options = CloudwatchMetricAssetOptions(namespaces=all_namespaces)
            return ConnectorModelTypeOptions(model_type=model_type, cloudwatch_metric_model_options=options)
        else:
            return None

    def get_asset_model_values(self, account: Account, model_type: ConnectorMetadataModelTypeProto,
                               filters: AccountConnectorAssetsModelFiltersProto, cloudwatch_models):
        which_one_of = filters.WhichOneof('filters')
        if model_type == ConnectorMetadataModelTypeProto.CLOUDWATCH_LOG_GROUP and (
                not which_one_of or which_one_of == 'cloudwatch_log_group_model_filters'):
            options: CloudwatchLogGroupAssetOptions = filters.cloudwatch_log_group_model_filters
            filter_regions = options.regions
            cloudwatch_models = cloudwatch_models.filter(
                model_type=ConnectorMetadataModelTypeProto.CLOUDWATCH_LOG_GROUP)
            if filter_regions:
                cloudwatch_models = cloudwatch_models.filter(model_uid__in=filter_regions)
        elif model_type == ConnectorMetadataModelTypeProto.CLOUDWATCH_METRIC and (
                not which_one_of or which_one_of == 'cloudwatch_metric_model_filters'):
            options: CloudwatchMetricAssetOptions = filters.cloudwatch_metric_model_filters
            namespaces = options.namespaces
            cloudwatch_models = cloudwatch_models.filter(model_type=ConnectorMetadataModelTypeProto.CLOUDWATCH_METRIC)
            if namespaces:
                cloudwatch_models = cloudwatch_models.filter(model_uid__in=namespaces)
        cw_asset_protos = []
        for asset in cloudwatch_models:
            if asset.model_type == ConnectorMetadataModelTypeProto.CLOUDWATCH_METRIC:
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
                cw_asset_protos.append(CloudwatchAssetModelProto(
                    id=UInt64Value(value=asset.id), connector_type=asset.connector_type,
                    type=asset.model_type,
                    last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                        asset.updated_at) else None,
                    cloudwatch_metric=cloudwatch_metric_proto))
            elif asset.model_type == ConnectorMetadataModelTypeProto.CLOUDWATCH_LOG_GROUP:
                for region, log_groups in asset.metadata.items():
                    cw_asset_protos.append(CloudwatchAssetModelProto(
                        id=UInt64Value(value=asset.id), connector_type=asset.connector_type,
                        type=asset.model_type,
                        last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                            asset.updated_at) else None,
                        cloudwatch_log_group=CloudwatchLogGroupAssetModelProto(
                            region=StringValue(value=asset.model_uid),
                            log_groups=log_groups)
                    ))
        return AccountConnectorAssets(cloudwatch=CloudwatchAssets(assets=cw_asset_protos))
