import { taskTypes } from "../constants/index.ts";

export const taskTypeMapping = {
  metric_execution: [
    taskTypes.CLOUDWATCH_METRIC,
    taskTypes.DATADOG_QUERY_METRIC_EXECUTION,
    taskTypes.DATADOG_SERVICE_METRIC_EXECUTION,
    taskTypes.GRAFANA_MIMIR_PROMQL_METRIC_EXECUTION,
    taskTypes.GRAFANA_PROMETHEUS_DATASOURCE,
    taskTypes.NEW_RELIC_ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION,
    taskTypes.NEW_RELIC_ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION,
    taskTypes.NEW_RELIC_NRQL_METRIC_EXECUTION,
  ],
  data_fetch: [
    taskTypes.AZURE_FILTER_LOG_EVENTS,
    taskTypes.CLICKHOUSE_SQL_QUERY,
    taskTypes.POSTGRES_SQL_QUERY,
    taskTypes.CLOUDWATCH_LOG_GROUP,
    taskTypes.EKS_GET_DEPLOYMENTS,
    taskTypes.EKS_GET_EVENTS,
    taskTypes.EKS_GET_PODS,
    taskTypes.EKS_GET_SERVICES,
    taskTypes.GKE_GET_DEPLOYMENTS,
    taskTypes.GKE_GET_EVENTS,
    taskTypes.GKE_GET_PODS,
    taskTypes.GKE_GET_SERVICES,
    taskTypes.SQL_DATABASE_CONNECTION_SQL_QUERY,
  ],
};
