from google.protobuf.wrappers_pb2 import StringValue

from accounts.models import Account
from connectors.crud.connector_asset_model_crud import get_connector_metadata_models
from connectors.crud.connectors_crud import get_db_connectors
from protos.connectors.connector_pb2 import ConnectorType, ConnectorMetadataModelType, AccountActiveConnectorModelTypes

playbooks_supported_connectors = [ConnectorType.CLOUDWATCH, ConnectorType.GRAFANA, ConnectorType.GRAFANA_VPC,
                                  ConnectorType.CLICKHOUSE, ConnectorType.EKS, ConnectorType.NEW_RELIC,
                                  ConnectorType.DATADOG, ConnectorType.POSTGRES]

supported_connectors_model_maps = {
    ConnectorType.CLOUDWATCH: [ConnectorMetadataModelType.CLOUDWATCH_METRIC,
                               ConnectorMetadataModelType.CLOUDWATCH_LOG_GROUP],
    ConnectorType.GRAFANA: [ConnectorMetadataModelType.GRAFANA_TARGET_METRIC_PROMQL],
    ConnectorType.GRAFANA_VPC: [ConnectorMetadataModelType.GRAFANA_TARGET_METRIC_PROMQL],
    ConnectorType.NEW_RELIC: [ConnectorMetadataModelType.NEW_RELIC_ENTITY_APPLICATION,
                              ConnectorMetadataModelType.NEW_RELIC_ENTITY_DASHBOARD,
                              ConnectorMetadataModelType.NEW_RELIC_NRQL],
    ConnectorType.CLICKHOUSE: [ConnectorMetadataModelType.CLICKHOUSE_DATABASE],
    ConnectorType.SLACK: [ConnectorMetadataModelType.SLACK_CHANNEL],
    ConnectorType.DATADOG: [ConnectorMetadataModelType.DATADOG_SERVICE, ConnectorMetadataModelType.DATADOG_QUERY],
    ConnectorType.POSTGRES: [ConnectorMetadataModelType.POSTGRES_DATABASE],
    ConnectorType.EKS: [ConnectorMetadataModelType.EKS_CLUSTER]
}

model_type_display_name_maps = {
    ConnectorMetadataModelType.CLOUDWATCH_METRIC: "Metric",
    ConnectorMetadataModelType.CLOUDWATCH_LOG_GROUP: "Log Group",
    ConnectorMetadataModelType.GRAFANA_TARGET_METRIC_PROMQL: "PromQL",
    ConnectorMetadataModelType.NEW_RELIC_ENTITY_APPLICATION: "Entity Application",
    ConnectorMetadataModelType.NEW_RELIC_ENTITY_DASHBOARD: "Entity Dashboard",
    ConnectorMetadataModelType.NEW_RELIC_NRQL: "Raw NRQL",
    ConnectorMetadataModelType.CLICKHOUSE_DATABASE: "Database",
    ConnectorMetadataModelType.DATADOG_SERVICE: "Service",
    ConnectorMetadataModelType.DATADOG_QUERY: "Custom Query",
    ConnectorMetadataModelType.POSTGRES_DATABASE: "Database",
    ConnectorMetadataModelType.EKS_CLUSTER: "Cluster",
}


def playbooks_builder_get_connector_sources_options(account: Account):
    active_account_connectors = get_db_connectors(account, connector_type_list=playbooks_supported_connectors,
                                                  is_active=True)
    active_model_type: [AccountActiveConnectorModelTypes] = []
    for connector in active_account_connectors:
        supported_model_types = supported_connectors_model_maps[connector.connector_type]
        active_model_types = get_connector_metadata_models(account, connector_type=connector.connector_type,
                                                           is_active=True, model_types=supported_model_types)
        active_model_types = active_model_types.values_list('model_type', flat=True).distinct()

        model_types_map: [AccountActiveConnectorModelTypes.ConnectorMetadataModelTypeMap] = []
        for amt in active_model_types:
            display_name = model_type_display_name_maps.get(amt, "")
            model_types_map.append(AccountActiveConnectorModelTypes.ConnectorMetadataModelTypeMap(model_type=amt,
                                                                                                  display_name=StringValue(
                                                                                                      value=display_name)))
        if connector.connector_type == ConnectorType.NEW_RELIC:
            model_type = ConnectorMetadataModelType.NEW_RELIC_NRQL
            display_name = model_type_display_name_maps.get(model_type, "")
            model_types_map.append(AccountActiveConnectorModelTypes.ConnectorMetadataModelTypeMap(model_type=model_type,
                                                                                                  display_name=StringValue(
                                                                                                      value=display_name)))

        if connector.connector_type == ConnectorType.DATADOG:
            model_type = ConnectorMetadataModelType.DATADOG_QUERY
            display_name = model_type_display_name_maps.get(model_type, "")
            model_types_map.append(AccountActiveConnectorModelTypes.ConnectorMetadataModelTypeMap(model_type=model_type,
                                                                                                  display_name=StringValue(
                                                                                                      value=display_name)))

        active_model_type.append(AccountActiveConnectorModelTypes(connector_type=connector.connector_type,
                                                                  model_types_map=model_types_map))
    return active_model_type
