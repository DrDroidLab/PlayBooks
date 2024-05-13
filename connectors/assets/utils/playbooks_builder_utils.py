from google.protobuf.wrappers_pb2 import StringValue

from accounts.models import Account
from connectors.crud.connector_asset_model_crud import get_db_account_connector_metadata_models
from connectors.crud.connectors_crud import get_db_account_connectors
from protos.base_pb2 import Source
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto, \
    AccountActiveConnectorModelTypes

playbooks_supported_sources = [Source.CLOUDWATCH, Source.GRAFANA, Source.GRAFANA_VPC,
                               Source.CLICKHOUSE, Source.EKS, Source.NEW_RELIC, Source.AZURE,
                               Source.DATADOG, Source.POSTGRES, Source.SQL_DATABASE_CONNECTION]

supported_connectors_model_maps = {
    Source.CLOUDWATCH: [ConnectorMetadataModelTypeProto.CLOUDWATCH_METRIC,
                        ConnectorMetadataModelTypeProto.CLOUDWATCH_LOG_GROUP],
    Source.GRAFANA: [ConnectorMetadataModelTypeProto.GRAFANA_TARGET_METRIC_PROMQL],
    Source.GRAFANA_VPC: [ConnectorMetadataModelTypeProto.GRAFANA_TARGET_METRIC_PROMQL],
    Source.NEW_RELIC: [ConnectorMetadataModelTypeProto.NEW_RELIC_ENTITY_APPLICATION,
                       ConnectorMetadataModelTypeProto.NEW_RELIC_ENTITY_DASHBOARD,
                       ConnectorMetadataModelTypeProto.NEW_RELIC_NRQL],
    Source.CLICKHOUSE: [ConnectorMetadataModelTypeProto.CLICKHOUSE_DATABASE],
    Source.SLACK: [ConnectorMetadataModelTypeProto.SLACK_CHANNEL],
    Source.DATADOG: [ConnectorMetadataModelTypeProto.DATADOG_SERVICE,
                     ConnectorMetadataModelTypeProto.DATADOG_QUERY],
    Source.POSTGRES: [ConnectorMetadataModelTypeProto.POSTGRES_DATABASE],
    Source.EKS: [ConnectorMetadataModelTypeProto.EKS_CLUSTER],
    Source.SQL_DATABASE_CONNECTION: [ConnectorMetadataModelTypeProto.SQL_DATABASE_CONNECTION_RAW_QUERY],
    Source.AZURE: [ConnectorMetadataModelTypeProto.AZURE_WORKSPACE],
}

model_type_display_name_maps = {
    ConnectorMetadataModelTypeProto.CLOUDWATCH_METRIC: "Metric",
    ConnectorMetadataModelTypeProto.CLOUDWATCH_LOG_GROUP: "Log Group",
    ConnectorMetadataModelTypeProto.GRAFANA_TARGET_METRIC_PROMQL: "PromQL",
    ConnectorMetadataModelTypeProto.NEW_RELIC_ENTITY_APPLICATION: "Entity Application",
    ConnectorMetadataModelTypeProto.NEW_RELIC_ENTITY_DASHBOARD: "Entity Dashboard",
    ConnectorMetadataModelTypeProto.NEW_RELIC_NRQL: "Raw NRQL",
    ConnectorMetadataModelTypeProto.CLICKHOUSE_DATABASE: "Database",
    ConnectorMetadataModelTypeProto.DATADOG_SERVICE: "Service",
    ConnectorMetadataModelTypeProto.DATADOG_QUERY: "Custom Query",
    ConnectorMetadataModelTypeProto.POSTGRES_DATABASE: "Database",
    ConnectorMetadataModelTypeProto.EKS_CLUSTER: "Cluster",
    ConnectorMetadataModelTypeProto.SQL_DATABASE_CONNECTION_RAW_QUERY: "Query",
    ConnectorMetadataModelTypeProto.AZURE_WORKSPACE: "Log Analytics Workspace",
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
        if connector.connector_type == Source.NEW_RELIC:
            model_type = ConnectorMetadataModelTypeProto.NEW_RELIC_NRQL
            display_name = model_type_display_name_maps.get(model_type, "")
            model_types_map.append(AccountActiveConnectorModelTypes.ConnectorMetadataModelTypeMap(model_type=model_type,
                                                                                                  display_name=StringValue(
                                                                                                      value=display_name)))

        if connector.connector_type == Source.DATADOG:
            model_type = ConnectorMetadataModelTypeProto.DATADOG_QUERY
            display_name = model_type_display_name_maps.get(model_type, "")
            model_types_map.append(AccountActiveConnectorModelTypes.ConnectorMetadataModelTypeMap(model_type=model_type,
                                                                                                  display_name=StringValue(
                                                                                                      value=display_name)))

        if connector.connector_type == Source.SQL_DATABASE_CONNECTION:
            model_type = ConnectorMetadataModelTypeProto.SQL_DATABASE_CONNECTION_RAW_QUERY
            display_name = model_type_display_name_maps.get(model_type, "")
            model_types_map.append(AccountActiveConnectorModelTypes.ConnectorMetadataModelTypeMap(model_type=model_type,
                                                                                                  display_name=StringValue(
                                                                                                      value=display_name)))

        active_model_type.append(AccountActiveConnectorModelTypes(connector_type=connector.connector_type,
                                                                  model_types_map=model_types_map))
    return active_model_type
