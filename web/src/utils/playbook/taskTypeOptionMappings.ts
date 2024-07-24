import { taskTypes } from "../../constants/index.ts";
import * as Options from "./options/index.ts";

export const taskTypeOptionMappings = {
  [taskTypes.API_HTTP_REQUEST]: Options.cloudwatchLogs,
  [taskTypes.AZURE_FILTER_LOG_EVENTS]: Options.cloudwatchLogs,
  [taskTypes.BASH_COMMAND]: Options.cloudwatchLogs,
  [taskTypes.CLICKHOUSE_SQL_QUERY]: Options.cloudwatchLogs,
  [taskTypes.CLICKHOUSE_SQL_QUERY]: Options.cloudwatchLogs,
  [taskTypes.CLOUDWATCH_LOG_GROUP]: Options.cloudwatchLogs,
  [taskTypes.CLOUDWATCH_METRIC]: Options.cloudwatchLogs,
  [taskTypes.DATADOG_QUERY_METRIC_EXECUTION]: Options.cloudwatchLogs,
  [taskTypes.DATADOG_QUERY_METRIC_EXECUTION]: Options.cloudwatchLogs,
  [taskTypes.DATADOG_SERVICE_METRIC_EXECUTION]: Options.cloudwatchLogs,
  [taskTypes.DOCUMENTATION_IFRAME]: Options.cloudwatchLogs,
  [taskTypes.DOCUMENTATION_MARKDOWN]: Options.cloudwatchLogs,
  [taskTypes.EKS_GET_DEPLOYMENTS]: Options.cloudwatchLogs,
  [taskTypes.EKS_GET_EVENTS]: Options.cloudwatchLogs,
  [taskTypes.EKS_GET_PODS]: Options.cloudwatchLogs,
  [taskTypes.EKS_GET_SERVICES]: Options.cloudwatchLogs,
  [taskTypes.EKS_KUBECTL_COMMAND]: Options.cloudwatchLogs,
  [taskTypes.ELASTIC_SEARCH_QUERY_LOGS]: Options.cloudwatchLogs,
  [taskTypes.GCM_FILTER_LOG_EVENTS]: Options.cloudwatchLogs,
  [taskTypes.GCM_MQL_EXECUTION]: Options.cloudwatchLogs,
  [taskTypes.GKE_GET_DEPLOYMENTS]: Options.cloudwatchLogs,
  [taskTypes.GKE_GET_EVENTS]: Options.cloudwatchLogs,
  [taskTypes.GKE_GET_PODS]: Options.cloudwatchLogs,
  [taskTypes.GKE_GET_SERVICES]: Options.cloudwatchLogs,
  [taskTypes.GKE_KUBECTL_COMMAND]: Options.cloudwatchLogs,
  [taskTypes.GRAFANA_LOKI_QUERY_LOGS]: Options.cloudwatchLogs,
  [taskTypes.GRAFANA_MIMIR_PROMQL_METRIC_EXECUTION]: Options.cloudwatchLogs,
  [taskTypes.GRAFANA_PROMETHEUS_DATASOURCE]: Options.cloudwatchLogs,
  [taskTypes.KUBERNETES_COMMAND]: Options.cloudwatchLogs,
  [taskTypes.NEW_RELIC_ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION]:
    Options.cloudwatchLogs,
  [taskTypes.NEW_RELIC_ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION]:
    Options.cloudwatchLogs,
};
