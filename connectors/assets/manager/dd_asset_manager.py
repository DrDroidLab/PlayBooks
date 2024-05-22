from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.connectors.assets.datadog_asset_pb2 import DatadogServiceAssetOptions, DatadogServiceAssetModel, \
    DatadogAssetModel, DatadogAssets
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelFilters, AccountConnectorAssets, \
    ConnectorModelTypeOptions
from protos.base_pb2 import Source as Source, SourceModelType as SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto


class DatadogAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.source = Source.DATADOG
        self.asset_type_callable_map = {
            SourceModelType.DATADOG_SERVICE: {
                'options': self.get_dd_service_options,
                'values': self.get_dd_service_values,
            }
        }

    @staticmethod
    def get_dd_service_options(dd_service_assets):
        all_service_metric_family_map = {}
        asset_model_options = []
        for asset in dd_service_assets:
            metadata = asset.metadata
            metrics = metadata.get('metrics', [])
            families = []
            for metric in metrics:
                family = metric.get('family')
                families.append(family)
            if families:
                all_service_metric_family_map[asset.model_uid] = families
                asset_model_options.append(
                    DatadogServiceAssetOptions.DatadogServiceAssetOption(name=StringValue(value=asset.model_uid),
                                                                         metric_families=list(set(families))))
        options = DatadogServiceAssetOptions(services=asset_model_options)
        return ConnectorModelTypeOptions(model_type=SourceModelType.DATADOG_SERVICE,
                                         datadog_service_model_options=options)

    @staticmethod
    def get_dd_service_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFilters,
                              dd_service_assets):
        which_one_of = filters.WhichOneof('filters')
        if which_one_of and which_one_of != 'datadog_service_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")

        options: DatadogServiceAssetOptions = filters.datadog_service_model_filters
        filter_service_options = options.services
        filter_services = []
        filter_service_metric_family_map = {}
        for option in filter_service_options:
            filter_services.append(option.name.value)
            filter_service_metric_family_map[option.name.value] = option.metric_families
        if filter_services:
            dd_service_assets = dd_service_assets.filter(model_uid__in=filter_services)
        dd_asset_protos = []
        for asset in dd_service_assets:
            metadata = asset.metadata
            metrics = metadata.get('metrics', [])
            if not metrics:
                continue
            metric_protos: [DatadogServiceAssetModel.Metric] = []
            metric_env_list = []
            filter_metric_families = []
            if asset.model_uid in filter_service_metric_family_map:
                filter_metric_families = filter_service_metric_family_map[asset.model_uid]
            for metric in metrics:
                family = metric.get('family')
                if filter_metric_families and family not in filter_metric_families:
                    continue
                tags = metric.get('tags', [])
                for tag in tags:
                    if tag.startswith('env:'):
                        env = tag.split(':')[1]
                        if env not in metric_env_list:
                            metric_env_list.append(env)
                query = metric.get('id')
                metric_protos.append(
                    DatadogServiceAssetModel.Metric(metric=StringValue(value=query),
                                                    metric_family=StringValue(value=family)))
            env_list = list(asset.metadata.keys())
            if 'metrics' in env_list:
                env_list.remove('metrics')
            for env in metric_env_list:
                if env not in env_list:
                    env_list.append(env)
            dd_asset_protos.append(DatadogAssetModel(
                id=UInt64Value(value=asset.id), connector_type=asset.connector_type,
                type=asset.model_type,
                last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                    asset.updated_at) else None,
                datadog_service=DatadogServiceAssetModel(
                    service_name=StringValue(value=asset.model_uid),
                    environments=env_list,
                    metrics=metric_protos)))
        return AccountConnectorAssets(connector=connector, datadog=DatadogAssets(assets=dd_asset_protos))
