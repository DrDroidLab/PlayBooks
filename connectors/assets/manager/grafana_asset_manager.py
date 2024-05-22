import logging
from datetime import timezone

from django.db.models import Q
from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from connectors.assets.manager.asset_manager import ConnectorAssetManager
from connectors.crud.connector_asset_model_crud import get_db_connector_metadata_models
from protos.connectors.assets.grafana_asset_pb2 import GrafanaTargetMetricPromQlAssetOptions, \
    GrafanaAssetModel as GrafanaAssetModelProto, GrafanaTargetMetricPromQlAssetModel, GrafanaAssets
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelFilters, AccountConnectorAssets, \
    ConnectorModelTypeOptions
from protos.base_pb2 import Source as Source, SourceModelType as SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto

logger = logging.getLogger(__name__)


class GrafanaAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.source = Source.GRAFANA
        self.asset_type_callable_map = {
            SourceModelType.GRAFANA_TARGET_METRIC_PROMQL: {
                'options': self.get_grafana_target_metric_promql_options,
                'values': self.get_grafana_target_metric_promql_values,
            }
        }

    @staticmethod
    def get_grafana_target_metric_promql_options(grafana_target_metric_promql_metric_assets):
        all_dashboards = {}
        for asset in grafana_target_metric_promql_metric_assets:
            dashboard = all_dashboards.get(asset.metadata.get('dashboard_id', ''), {})
            panels = dashboard.get('panels', [])
            panels.append(
                {'panel_id': asset.metadata.get('panel_id', None),
                 'panel_title': asset.metadata.get('panel_title', '')})
            panels_list = [tuple(sorted(d.items())) for d in panels]
            unique_tuples = set(panels_list)
            panels = [dict(pair) for pair in unique_tuples]
            dashboard['panels'] = panels
            dashboard['dashboard_title'] = asset.metadata.get('dashboard_title', '')
            all_dashboards[asset.metadata.get('dashboard_id', '')] = dashboard
        dashboard_options: [GrafanaTargetMetricPromQlAssetOptions.GrafanaDashboardOptions] = []
        for dashboard_id, dict_items in all_dashboards.items():
            panel_options: [GrafanaTargetMetricPromQlAssetOptions.GrafanaPanelOptions] = []
            for panel in dict_items['panels']:
                panel_options.append(
                    GrafanaTargetMetricPromQlAssetOptions.GrafanaDashboardOptions.GrafanaPanelOptions(
                        panel_id=StringValue(value=str(panel['panel_id'])),
                        panel_title=StringValue(value=panel['panel_title'])))
            dashboard_options.append(GrafanaTargetMetricPromQlAssetOptions.GrafanaDashboardOptions(
                dashboard_id=StringValue(value=dashboard_id),
                dashboard_title=StringValue(value=dict_items['dashboard_title']),
                panel_options=panel_options))
        options = GrafanaTargetMetricPromQlAssetOptions(dashboards=dashboard_options)
        return ConnectorModelTypeOptions(model_type=SourceModelType.GRAFANA_TARGET_METRIC_PROMQL,
                                         grafana_target_metric_promql_model_options=options)

    @staticmethod
    def get_grafana_target_metric_promql_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFilters,
                                                grafana_target_metric_promql_metric_assets):
        which_one_of = filters.WhichOneof('filters')
        if which_one_of and which_one_of != 'grafana_target_metric_promql_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")

        options: GrafanaTargetMetricPromQlAssetOptions = filters.grafana_target_metric_promql_model_filters
        filter_dashboards = options.dashboards
        filter_model_uids = []
        for item in filter_dashboards:
            filter_str = item.dashboard_id.value
            filter_panel_options = item.panel_options
            if filter_panel_options:
                for panel_options in filter_panel_options:
                    filter_model_uids.append(f"{filter_str}#{panel_options.panel_id.value}")
            else:
                filter_model_uids.append(filter_str)
            if filter_model_uids:
                startswith_conditions = Q()
                for string in filter_model_uids:
                    startswith_conditions |= Q(model_uid__startswith=string)
                grafana_target_metric_promql_metric_assets = grafana_target_metric_promql_metric_assets.filter(
                    startswith_conditions)

        grafana_asset_protos = []
        target_metric_promql_dashboard_panel_map = {}
        for asset in grafana_target_metric_promql_metric_assets:
            dashboards = target_metric_promql_dashboard_panel_map.get(asset.metadata.get('dashboard_id'), {})
            panel_dict = dashboards.get('panels', {})
            panel_id = asset.metadata.get('panel_id')
            panels = panel_dict.get(panel_id, [])
            panels.append({'model_uid': asset.model_uid, 'metadata': asset.metadata})
            panel_dict[panel_id] = panels
            dashboards['panels'] = panel_dict
            dashboards['dashboard_title'] = asset.metadata.get('dashboard_title')
            target_metric_promql_dashboard_panel_map[asset.metadata.get('dashboard_id')] = dashboards

        for dashboard, dashboard_dict in target_metric_promql_dashboard_panel_map.items():
            panel_promql_map_list = []
            panels = dashboard_dict.get('panels', {})
            dashboard_title = dashboard_dict.get('dashboard_title')
            for panel_id, prom_ql_data_list in panels.items():
                promql_metrics: [GrafanaTargetMetricPromQlAssetModel.PromqlMetric] = []
                if not prom_ql_data_list or len(prom_ql_data_list) == 0:
                    continue
                for item in prom_ql_data_list:
                    label_variable_map: [
                        GrafanaTargetMetricPromQlAssetModel.PromqlMetric.QueryLabelVariableMap] = []
                    if 'optional_label_variable_pairs' in item['metadata']:
                        for key, value in item['metadata']['optional_label_variable_pairs'].items():
                            label_variable_map.append(
                                GrafanaTargetMetricPromQlAssetModel.PromqlMetric.QueryLabelVariableMap(
                                    label=StringValue(value=key), variable=StringValue(value=value)))

                    variable_values_options: [
                        GrafanaTargetMetricPromQlAssetModel.PromqlMetric.QueryVariableValueOptions] = []
                    if 'optional_label_options' in item['metadata']:
                        for key, values in item['metadata']['optional_label_options'].items():
                            variable_values_options.append(
                                GrafanaTargetMetricPromQlAssetModel.PromqlMetric.QueryVariableValueOptions(
                                    variable=StringValue(value=key), values=values))

                    promql_metrics.append(GrafanaTargetMetricPromQlAssetModel.PromqlMetric(
                        target_metric_ref_id=StringValue(value=item['metadata'].get('target_metric_ref_id')),
                        datasource_uid=StringValue(value=item['metadata'].get('datasource_uid')),
                        expression=StringValue(value=item['metadata'].get('expr')),
                        variable_values_options=variable_values_options,
                        label_variable_map=label_variable_map
                    ))
                panel_promql_map = GrafanaTargetMetricPromQlAssetModel.PanelPromqlMap(
                    panel_id=StringValue(value=str(panel_id)),
                    panel_title=StringValue(value=prom_ql_data_list[0]['metadata'].get('panel_title', '')),
                    promql_metrics=promql_metrics)
                panel_promql_map_list.append(panel_promql_map)
            dashboard_asset = get_db_connector_metadata_models(connector.account_id.value, model_uid=dashboard,
                                                               connector_type=connector.type,
                                                               model_type=SourceModelType.GRAFANA_DASHBOARD,
                                                               is_active=True)
            if not dashboard_asset:
                logger.error(f"Dashboard not found: {dashboard}")
                continue
            dashboard_asset = dashboard_asset.first()
            grafana_asset_protos.append(GrafanaAssetModelProto(
                id=UInt64Value(value=dashboard_asset.id),
                connector_type=connector.type,
                type=SourceModelType.GRAFANA_TARGET_METRIC_PROMQL,
                last_updated=int(dashboard_asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                    dashboard_asset.updated_at) else None,
                grafana_target_metric_promql=GrafanaTargetMetricPromQlAssetModel(
                    dashboard_id=StringValue(value=dashboard),
                    dashboard_title=StringValue(value=dashboard_title),
                    dashboard_url=StringValue(value=dashboard_asset.metadata.get('meta', {}).get('url', '')),
                    panel_promql_map=panel_promql_map_list)))
        return AccountConnectorAssets(grafana=GrafanaAssets(assets=grafana_asset_protos))
