from google.protobuf.wrappers_pb2 import StringValue

from accounts.models import Account
from connectors.crud.connector_asset_model_crud import get_db_account_connector_metadata_models
from connectors.crud.connectors_crud import get_db_account_connectors
from protos.base_pb2 import Source, SourceModelType
from protos.connectors.connector_pb2 import AccountActiveConnectorModelTypes

playbooks_supported_sources = [Source.CLOUDWATCH, Source.GRAFANA, Source.GRAFANA_VPC,
                               Source.CLICKHOUSE, Source.EKS, Source.NEW_RELIC, Source.AZURE,
                               Source.DATADOG, Source.POSTGRES, Source.SQL_DATABASE_CONNECTION, Source.GRAFANA_MIMIR]

supported_connectors_model_maps = {
    Source.CLOUDWATCH: [SourceModelType.CLOUDWATCH_METRIC, SourceModelType.CLOUDWATCH_LOG_GROUP],
    Source.GRAFANA: [SourceModelType.GRAFANA_PROMETHEUS_DATASOURCE],
    Source.GRAFANA_VPC: [SourceModelType.GRAFANA_PROMETHEUS_DATASOURCE],
    Source.NEW_RELIC: [SourceModelType.NEW_RELIC_ENTITY_APPLICATION, SourceModelType.NEW_RELIC_ENTITY_DASHBOARD,
                       SourceModelType.NEW_RELIC_NRQL],
    Source.CLICKHOUSE: [SourceModelType.CLICKHOUSE_DATABASE],
    Source.SLACK: [SourceModelType.SLACK_CHANNEL],
    Source.DATADOG: [SourceModelType.DATADOG_SERVICE, SourceModelType.DATADOG_QUERY],
    Source.EKS: [SourceModelType.EKS_CLUSTER],
    Source.SQL_DATABASE_CONNECTION: [SourceModelType.SQL_DATABASE_CONNECTION_RAW_QUERY],
    Source.GRAFANA_MIMIR: [],
    Source.POSTGRES: [SourceModelType.POSTGRES_QUERY],
    Source.AZURE: [SourceModelType.AZURE_WORKSPACE],
}

model_type_display_name_maps = {
    SourceModelType.CLOUDWATCH_METRIC: "Metric",
    SourceModelType.CLOUDWATCH_LOG_GROUP: "Log Group",
    SourceModelType.GRAFANA_TARGET_METRIC_PROMQL: "PromQL",
    SourceModelType.GRAFANA_PROMETHEUS_DATASOURCE: "Data Sources",
    SourceModelType.NEW_RELIC_ENTITY_APPLICATION: "Entity Application",
    SourceModelType.NEW_RELIC_ENTITY_DASHBOARD: "Entity Dashboard",
    SourceModelType.NEW_RELIC_NRQL: "Raw NRQL",
    SourceModelType.CLICKHOUSE_DATABASE: "Database",
    SourceModelType.DATADOG_SERVICE: "Service",
    SourceModelType.DATADOG_QUERY: "Custom Query",
    SourceModelType.EKS_CLUSTER: "Cluster",
    SourceModelType.SQL_DATABASE_CONNECTION_RAW_QUERY: "Query",
    SourceModelType.GRAFANA_MIMIR_PROMQL: "PromQL",
    SourceModelType.POSTGRES_QUERY: "Sql Query",
    SourceModelType.AZURE_WORKSPACE: "Azure Log Analytics Workspace",
    SourceModelType.SSH_SERVER: "SSH Server",
}


def playbooks_builder_get_connector_sources_options(account: Account):
    active_account_connectors = get_db_account_connectors(account, connector_type_list=playbooks_supported_sources,
                                                          is_active=True)
    active_model_type: [AccountActiveConnectorModelTypes] = []
    for connector in active_account_connectors:
        supported_model_types = supported_connectors_model_maps[connector.connector_type]
        active_model_types = get_db_account_connector_metadata_models(account, connector_type=connector.connector_type,
                                                                      is_active=True, model_types=supported_model_types)
        active_model_types = active_model_types.values_list('model_type', flat=True).distinct()

        model_types_map: [AccountActiveConnectorModelTypes.ConnectorMetadataModelTypeMap] = []
        for amt in active_model_types:
            display_name = model_type_display_name_maps.get(amt, "")
            model_types_map.append(AccountActiveConnectorModelTypes.ConnectorMetadataModelTypeMap(model_type=amt,
                                                                                                  display_name=StringValue(
                                                                                                      value=display_name)))
        if connector.connector_type == Source.POSTGRES:
            model_type = SourceModelType.POSTGRES_QUERY
            display_name = model_type_display_name_maps.get(model_type, "")
            model_types_map.append(AccountActiveConnectorModelTypes.ConnectorMetadataModelTypeMap(model_type=model_type,
                                                                                                  display_name=StringValue(
                                                                                                      value=display_name)))

        if connector.connector_type == Source.NEW_RELIC:
            model_type = SourceModelType.NEW_RELIC_NRQL
            display_name = model_type_display_name_maps.get(model_type, "")
            model_types_map.append(AccountActiveConnectorModelTypes.ConnectorMetadataModelTypeMap(model_type=model_type,
                                                                                                  display_name=StringValue(
                                                                                                      value=display_name)))

        if connector.connector_type == Source.DATADOG:
            model_type = SourceModelType.DATADOG_QUERY
            display_name = model_type_display_name_maps.get(model_type, "")
            model_types_map.append(AccountActiveConnectorModelTypes.ConnectorMetadataModelTypeMap(model_type=model_type,
                                                                                                  display_name=StringValue(
                                                                                                      value=display_name)))

        if connector.connector_type == Source.SQL_DATABASE_CONNECTION:
            model_type = SourceModelType.SQL_DATABASE_CONNECTION_RAW_QUERY
            display_name = model_type_display_name_maps.get(model_type, "")
            model_types_map.append(AccountActiveConnectorModelTypes.ConnectorMetadataModelTypeMap(model_type=model_type,
                                                                                                  display_name=StringValue(
                                                                                                      value=display_name)))

        if connector.connector_type == Source.GRAFANA_MIMIR:
            model_type = SourceModelType.GRAFANA_MIMIR_PROMQL
            display_name = model_type_display_name_maps.get(model_type, "")
            model_types_map.append(AccountActiveConnectorModelTypes.ConnectorMetadataModelTypeMap(model_type=model_type,
                                                                                                  display_name=StringValue(
                                                                                                      value=display_name)))

        active_model_type.append(AccountActiveConnectorModelTypes(connector_type=connector.connector_type,
                                                                  model_types_map=model_types_map))
    return active_model_type
