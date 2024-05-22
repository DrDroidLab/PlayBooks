from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.connectors.assets.newrelic_asset_pb2 import NewRelicApplicationEntityAssetOptions, NewRelicAssets, \
    NewRelicAssetModel, NewRelicApplicationEntityAssetModel, NewRelicDashboardEntityAssetModel, \
    NewRelicDashboardEntityAssetOptions
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelFilters, AccountConnectorAssets, \
    ConnectorModelTypeOptions
from protos.base_pb2 import Source as Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto


class NewRelicAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.source = Source.NEW_RELIC
        self.asset_type_callable_map = {
            SourceModelType.NEW_RELIC_ENTITY_APPLICATION: {
                'options': self.get_nr_entity_application_options,
                'values': self.get_nr_entity_application_values,
            },
            SourceModelType.NEW_RELIC_ENTITY_DASHBOARD: {
                'options': self.get_nr_entity_dashboard_options,
                'values': self.get_nr_entity_dashboard_values,
            },
        }

    @staticmethod
    def get_nr_entity_application_options(nr_entity_application_assets):
        all_application_entities = []
        for asset in nr_entity_application_assets:
            all_application_entities.append(asset.metadata.get('name', ''))
        options = NewRelicApplicationEntityAssetOptions(application_names=all_application_entities)
        return ConnectorModelTypeOptions(model_type=SourceModelType.NEW_RELIC_ENTITY_APPLICATION,
                                         new_relic_entity_application_model_options=options)

    @staticmethod
    def get_nr_entity_application_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFilters,
                                         nr_entity_application_assets):
        which_one_of = filters.WhichOneof('filters')
        if which_one_of and which_one_of != 'new_relic_entity_application_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")

        options: NewRelicApplicationEntityAssetOptions = filters.new_relic_entity_application_model_filters
        filter_applications = options.application_names
        if filter_applications:
            nr_entity_application_assets = nr_entity_application_assets.filter(metadata__name__in=filter_applications)

        nr_asset_protos = []
        for asset in nr_entity_application_assets:
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

        return AccountConnectorAssets(connector=connector, new_relic=NewRelicAssets(assets=nr_asset_protos))

    @staticmethod
    def get_nr_entity_dashboard_options(nr_entity_dashboard_assets):
        all_dashboards = {}
        for asset in nr_entity_dashboard_assets:
            dashboard = all_dashboards.get(asset.metadata.get('guid', {}), {})
            pages = dashboard.get('pages', [])
            asset_pages = asset.metadata.get('pages', [])
            for page in asset_pages:
                pages.append({'page_guid': page.get('guid', ''), 'page_name': page.get('name', '')})
            dashboard['pages'] = pages
            dashboard['dashboard_name'] = asset.metadata.get('name', '')
            all_dashboards[asset.metadata.get('guid')] = dashboard

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
        return ConnectorModelTypeOptions(model_type=SourceModelType.NEW_RELIC_ENTITY_DASHBOARD,
                                         new_relic_entity_dashboard_model_options=NewRelicDashboardEntityAssetOptions(
                                             dashboards=dashboard_options))

    @staticmethod
    def get_nr_entity_dashboard_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFilters,
                                       nr_entity_dashboard_assets):
        which_one_of = filters.WhichOneof('filters')
        if which_one_of and which_one_of != 'new_relic_entity_dashboard_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")

        dashboard_page_filters = {}

        options: NewRelicDashboardEntityAssetOptions = filters.new_relic_entity_dashboard_model_filters
        filter_dashboards = options.dashboards
        if filter_dashboards:
            all_dashboard_guids = [x.dashboard_guid.value for x in filter_dashboards]
            nr_entity_dashboard_assets = nr_entity_dashboard_assets.filter(model_uid__in=all_dashboard_guids)
        for db in filter_dashboards:
            filter_page_options: [
                NewRelicDashboardEntityAssetOptions.DashboardOptions.DashboardPageOptions] = db.page_options
            if filter_page_options:
                dashboard_page_filters[db.dashboard_guid.value] = [x.page_guid.value for x in filter_page_options]

        nr_asset_protos = []
        for asset in nr_entity_dashboard_assets:
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

        return AccountConnectorAssets(connector=connector, new_relic=NewRelicAssets(assets=nr_asset_protos))
