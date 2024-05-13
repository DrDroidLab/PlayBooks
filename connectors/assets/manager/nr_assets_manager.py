from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from accounts.models import Account
from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.connectors.assets.newrelic_asset_pb2 import NewRelicApplicationEntityAssetOptions, NewRelicAssets, \
    NewRelicAssetModel, NewRelicApplicationEntityAssetModel, NewRelicDashboardEntityAssetModel, \
    NewRelicDashboardEntityAssetOptions
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelFilters, AccountConnectorAssetsModelOptions, \
    AccountConnectorAssets
from protos.base_pb2 import Source as ConnectorType
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto


class NewRelicAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.connector_type = ConnectorType.NEW_RELIC

    def get_asset_model_options(self, model_type: ConnectorMetadataModelTypeProto, model_uid_metadata_list):
        if model_type == ConnectorMetadataModelTypeProto.NEW_RELIC_ENTITY_APPLICATION:
            all_application_entities = []
            for item in model_uid_metadata_list:
                all_application_entities.append(item['metadata']['name'])
            options = NewRelicApplicationEntityAssetOptions(application_names=all_application_entities)
            return AccountConnectorAssetsModelOptions.ModelTypeOption(model_type=model_type,
                                                                      new_relic_entity_application_model_options=options)
        elif model_type == ConnectorMetadataModelTypeProto.NEW_RELIC_ENTITY_DASHBOARD:
            all_dashboards = {}
            for item in model_uid_metadata_list:
                dashboard = all_dashboards.get(item['metadata']['guid'], {})
                pages = dashboard.get('pages', [])
                pages.append(
                    {'page_guid': item['metadata']['guid'], 'page_name': item['metadata'].get('name', '')})
                pages_list = [tuple(sorted(d.items())) for d in pages]
                unique_tuples = set(pages_list)
                pages = [dict(pair) for pair in unique_tuples]
                dashboard['pages'] = pages
                dashboard['dashboard_name'] = item['metadata']['name']
                all_dashboards[item['metadata']['guid']] = dashboard
            dashboard_options: [NewRelicDashboardEntityAssetOptions.DashboardOptions] = []
            for dashboard_id, dict_items in all_dashboards.items():
                page_options: [NewRelicDashboardEntityAssetOptions.DashboardOptions.DashboardPageOptions] = []
                for page in dict_items['pages']:
                    page_options.append(NewRelicDashboardEntityAssetOptions.DashboardOptions.DashboardPageOptions(
                        page_guid=StringValue(value=page['page_guid']),
                        page_name=StringValue(value=page['page_name'])))
                dashboard_options.append(NewRelicDashboardEntityAssetOptions.DashboardOptions(
                    dashboard_guid=StringValue(value=dashboard_id),
                    dashboard_name=StringValue(value=dict_items['dashboard_name']),
                    page_options=page_options))
            return AccountConnectorAssetsModelOptions.ModelTypeOption(model_type=model_type,
                                                                      new_relic_entity_dashboard_model_options=NewRelicDashboardEntityAssetOptions(
                                                                          dashboards=dashboard_options))
        elif model_type == ConnectorMetadataModelTypeProto.NEW_RELIC_NRQL:
            return AccountConnectorAssetsModelOptions.ModelTypeOption(model_type=model_type)
        else:
            return None

    def get_asset_model_values(self, account: Account, model_type: ConnectorMetadataModelTypeProto,
                               filters: AccountConnectorAssetsModelFilters, nr_models):
        which_one_of = filters.WhichOneof('filters')

        dashboard_page_filters = {}
        if model_type == ConnectorMetadataModelTypeProto.NEW_RELIC_ENTITY_APPLICATION and (
                not which_one_of or which_one_of == 'new_relic_entity_application_model_filters'):
            options: NewRelicApplicationEntityAssetOptions = filters.new_relic_entity_application_model_filters
            filter_applications = options.application_names
            nr_models = nr_models.filter(model_type=ConnectorMetadataModelTypeProto.NEW_RELIC_ENTITY_APPLICATION)
            if filter_applications:
                nr_models = nr_models.filter(metadata__name__in=filter_applications)
        elif model_type == ConnectorMetadataModelTypeProto.NEW_RELIC_ENTITY_DASHBOARD and (
                not which_one_of or which_one_of == 'new_relic_entity_dashboard_model_filters'):
            options: NewRelicDashboardEntityAssetOptions = filters.new_relic_entity_dashboard_model_filters
            nr_models = nr_models.filter(model_type=ConnectorMetadataModelTypeProto.NEW_RELIC_ENTITY_DASHBOARD)
            filter_dashboards = options.dashboards
            if filter_dashboards:
                all_dashboard_guids = [x.dashboard_guid.value for x in filter_dashboards]
                nr_models = nr_models.filter(model_uid__in=all_dashboard_guids)
            for db in filter_dashboards:
                filter_page_options: NewRelicDashboardEntityAssetOptions.DashboardOptions.DashboardPageOptions = db.page_options
                if filter_page_options:
                    dashboard_page_filters[db.dashboard_guid.value] = [x.page_guid.value for x in filter_page_options]
        elif model_type == ConnectorMetadataModelTypeProto.NEW_RELIC_NRQL:
            nr_models = []
        nr_asset_protos = []
        for asset in nr_models:
            if asset.model_type == ConnectorMetadataModelTypeProto.NEW_RELIC_ENTITY_APPLICATION:
                asset_golden_metrics: [NewRelicApplicationEntityAssetModel.GoldenMetric] = []
                asset_metadata = asset.metadata
                golden_metrics = asset_metadata.get('goldenMetrics', {}).get('metrics', [])
                for metric in golden_metrics:
                    asset_golden_metrics.append(
                        NewRelicApplicationEntityAssetModel.GoldenMetric(
                            golden_metric_name=StringValue(value=metric.get('name')),
                            golden_metric_unit=StringValue(value=metric.get('unit')),
                            golden_metric_nrql_expression=StringValue(value=metric.get('query'))
                        ))
                nr_asset_protos.append(NewRelicAssetModel(
                    id=UInt64Value(value=asset.id),
                    connector_type=asset.connector_type,
                    type=asset.model_type,
                    last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                        asset.updated_at) else None,
                    new_relic_entity_application=NewRelicApplicationEntityAssetModel(
                        application_entity_guid=StringValue(value=asset.model_uid),
                        application_name=StringValue(value=asset.metadata.get('name')),
                        golden_metrics=asset_golden_metrics
                    )))
            elif asset.model_type == ConnectorMetadataModelTypeProto.NEW_RELIC_ENTITY_DASHBOARD:
                metadata = asset.metadata
                asset_pages = metadata.get('pages', [])
                pages: [NewRelicDashboardEntityAssetModel.DashboardPage] = []
                for page in asset_pages:
                    if dashboard_page_filters and asset.model_uid in dashboard_page_filters and page.get(
                            'guid') not in dashboard_page_filters.get(asset.model_uid):
                        continue
                    widgets: [NewRelicDashboardEntityAssetModel.PageWidget] = []
                    page_widgets = page.get('widgets', [])
                    for widget in page_widgets:
                        all_queries, widget_type = None, None
                        configuration = widget.get('configuration', {})
                        if not configuration:
                            continue
                        bar = configuration.get('bar', {})
                        if bar:
                            widget_type = 'bar'
                            all_queries = [x.get('query', '') for x in bar.get('nrqlQueries', [])]
                        pie = configuration.get('pie', {})
                        if pie:
                            widget_type = 'pie'
                            all_queries = [x.get('query', '') for x in pie.get('nrqlQueries', [])]
                        area = configuration.get('area', {})
                        if area:
                            widget_type = 'area'
                            all_queries = [x.get('query', '') for x in area.get('nrqlQueries', [])]
                        line = configuration.get('line', {})
                        if line:
                            widget_type = 'line'
                            all_queries = [x.get('query', '') for x in line.get('nrqlQueries', [])]
                        table = configuration.get('table', {})
                        if table:
                            widget_type = 'table'
                            all_queries = [x.get('query', '') for x in table.get('nrqlQueries', [])]
                        markdown = configuration.get('markdown', {})
                        if markdown:
                            widget_type = 'markdown'
                            all_queries = [x.get('query', '') for x in markdown.get('nrqlQueries', [])]
                        billboard = configuration.get('billboard', {})
                        if billboard:
                            widget_type = 'billboard'
                            all_queries = [x.get('query', '') for x in billboard.get('nrqlQueries', [])]
                        if not all_queries or not widget_type:
                            continue
                        for query in all_queries:
                            widgets.append(NewRelicDashboardEntityAssetModel.PageWidget(
                                widget_id=StringValue(value=widget.get('id')),
                                widget_title=StringValue(value=widget.get('title')),
                                widget_type=StringValue(value=widget_type),
                                widget_nrql_expression=StringValue(value=query)
                            ))
                    pages.append(NewRelicDashboardEntityAssetModel.DashboardPage(
                        page_guid=StringValue(value=page.get('guid')),
                        page_name=StringValue(value=page.get('name')),
                        widgets=widgets
                    ))
                nr_asset_protos.append(NewRelicAssetModel(
                    id=UInt64Value(value=asset.id),
                    connector_type=asset.connector_type,
                    type=asset.model_type,
                    last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                        asset.updated_at) else None,
                    new_relic_entity_dashboard=NewRelicDashboardEntityAssetModel(
                        dashboard_guid=StringValue(value=asset.model_uid),
                        dashboard_name=StringValue(value=asset.metadata.get('name')),
                        pages=pages
                    )))

        return AccountConnectorAssets(new_relic=NewRelicAssets(assets=nr_asset_protos))
