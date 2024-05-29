from datetime import timezone

from django.db.models import Q
from google.protobuf.wrappers_pb2 import UInt64Value, StringValue, BoolValue

from accounts.models import Account
from connectors.assets.manager.asset_manager import ConnectorAssetManager
from connectors.crud.connector_asset_model_crud import get_db_account_connector_metadata_models
from protos.connectors.assets.grafana_asset_pb2 import GrafanaTargetMetricPromQlAssetOptions, \
    GrafanaAssetModel as GrafanaAssetModelProto, GrafanaTargetMetricPromQlAssetModel, GrafanaAssets, \
    GrafanaDatasourceAssetOptions, GrafanaDatasourceAssetModel
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelFilters, AccountConnectorAssets, \
    ConnectorModelTypeOptions
from protos.base_pb2 import Source as Source, SourceModelType as SourceModelType


class GrafanaAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.source = Source.GRAFANA

    def get_asset_model_options(self, model_type: SourceModelType, model_uid_metadata_list):
        if model_type == SourceModelType.GRAFANA_TARGET_METRIC_PROMQL:
            all_dashboards = {}
            for item in model_uid_metadata_list:
                dashboard = all_dashboards.get(item['metadata']['dashboard_id'], {})
                panels = dashboard.get('panels', [])
                panels.append(
                    {'panel_id': item['metadata']['panel_id'], 'panel_title': item['metadata'].get('panel_title', '')})
                panels_list = [tuple(sorted(d.items())) for d in panels]
                unique_tuples = set(panels_list)
                panels = [dict(pair) for pair in unique_tuples]
                dashboard['panels'] = panels
                dashboard['dashboard_title'] = item['metadata']['dashboard_title']
                all_dashboards[item['metadata']['dashboard_id']] = dashboard
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
            return ConnectorModelTypeOptions(model_type=model_type, grafana_target_metric_promql_model_options=options)
        elif model_type == SourceModelType.GRAFANA_PROMETHEUS_DATASOURCE:
            prometheus_data_source_options: [GrafanaDatasourceAssetOptions] = []
            for item in model_uid_metadata_list:
                model_uid = item['model_uid']
                metadata = item['metadata']
                prometheus_data_source_options.append(GrafanaDatasourceAssetOptions.GrafanaDatasourceOptions(
                    datasource_id=UInt64Value(value=metadata.get('id', None)),
                    datasource_uid=StringValue(value=model_uid),
                    datasource_name=StringValue(value=metadata.get('name', ''))
                ))
            return ConnectorModelTypeOptions(model_type=model_type,
                                             grafana_prometheus_datasource_model_options=GrafanaDatasourceAssetOptions(
                                                 prometheus_datasources=prometheus_data_source_options))
        else:
            return None

    def get_asset_model_values(self, account: Account, model_type: SourceModelType,
                               filters: AccountConnectorAssetsModelFilters, grafana_models):
        which_one_of = filters.WhichOneof('filters')

        if model_type == SourceModelType.GRAFANA_TARGET_METRIC_PROMQL and (
                not which_one_of or which_one_of == 'grafana_target_metric_promql_model_filters'):
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

            grafana_models = grafana_models.filter(
                model_type=SourceModelType.GRAFANA_TARGET_METRIC_PROMQL)
            if filter_model_uids:
                startswith_conditions = Q()
                for string in filter_model_uids:
                    startswith_conditions |= Q(model_uid__startswith=string)
                grafana_models = grafana_models.filter(startswith_conditions)

        if model_type == SourceModelType.GRAFANA_PROMETHEUS_DATASOURCE and (
                not which_one_of or which_one_of == 'grafana_prometheus_datasource_model_filters'):
            options: GrafanaDatasourceAssetOptions = filters.grafana_prometheus_datasource_model_filters
            filter_sources: [GrafanaDatasourceAssetOptions.GrafanaDatasourceOptions] = options.prometheus_datasources
            filter_model_uids = []
            for item in filter_sources:
                model_uid = item.datasource_uid.value
                filter_model_uids.append(model_uid)

            grafana_models = grafana_models.filter(
                model_type=SourceModelType.GRAFANA_PROMETHEUS_DATASOURCE)
            if filter_model_uids:
                grafana_models = grafana_models.filter(model_uid__in=filter_model_uids)

        grafana_asset_protos = []
        target_metric_promql_dashboard_panel_map = {}
        for asset in grafana_models:
            if asset.model_type == SourceModelType.GRAFANA_PROMETHEUS_DATASOURCE:
                grafana_asset_protos.append(GrafanaAssetModelProto(
                    id=UInt64Value(value=asset.id),
                    connector_type=self.source,
                    type=SourceModelType.GRAFANA_PROMETHEUS_DATASOURCE,
                    last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                        asset.updated_at) else None,
                    grafana_prometheus_datasource=GrafanaDatasourceAssetModel(
                        datasource_id=UInt64Value(value=asset.metadata.get('id', None)),
                        datasource_uid=StringValue(value=asset.model_uid),
                        datasource_name=StringValue(value=asset.metadata.get('name', '')),
                        datasource_url=StringValue(value=asset.metadata.get('url', '')),
                        datasource_type=StringValue(value=asset.metadata.get('type', '')),
                        datasource_orgId=UInt64Value(value=asset.metadata.get('orgId', '')),
                        datasource_access=StringValue(value=asset.metadata.get('access', '')),
                        datasource_database=StringValue(value=asset.metadata.get('database', '')),
                        datasource_readonly=BoolValue(value=asset.metadata.get('readonly', None)),
                        datasource_typeName=StringValue(value=asset.metadata.get('typeName', '')),
                        datasource_basicAuth=BoolValue(value=asset.metadata.get('basicAuth', None)),
                        datasource_isDefault=BoolValue(value=asset.metadata.get('isDefault', None))
                    )
                ))
            elif asset.model_type == SourceModelType.GRAFANA_TARGET_METRIC_PROMQL:
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
            connector_type = self.source
            dashboard_asset = get_db_account_connector_metadata_models(account, model_uid=dashboard,
                                                                       connector_type=connector_type,
                                                                       model_type=SourceModelType.GRAFANA_DASHBOARD,
                                                                       is_active=True).first()
            grafana_asset_protos.append(GrafanaAssetModelProto(
                id=UInt64Value(value=dashboard_asset.id),
                connector_type=self.source,
                type=SourceModelType.GRAFANA_TARGET_METRIC_PROMQL,
                last_updated=int(dashboard_asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                    dashboard_asset.updated_at) else None,
                grafana_target_metric_promql=GrafanaTargetMetricPromQlAssetModel(
                    dashboard_id=StringValue(value=dashboard),
                    dashboard_title=StringValue(value=dashboard_title),
                    dashboard_url=StringValue(value=dashboard_asset.metadata.get('meta', {}).get('url', '')),
                    panel_promql_map=panel_promql_map_list)))
        return AccountConnectorAssets(grafana=GrafanaAssets(assets=grafana_asset_protos))
