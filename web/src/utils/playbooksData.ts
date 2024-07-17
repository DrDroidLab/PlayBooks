import { taskTypes } from "../constants/index.ts";
import * as Builders from "./builders/index.ts";
import getCurrentTask from "./getCurrentTask.ts";

export const constructBuilder = (id?: string) => {
  const [task, currentStepId] = getCurrentTask(id);

  if (!task) return {};

  let ops: any = task?.ui_requirement.modelOptions ?? [];

  switch (`${task?.source} ${task?.[task.source?.toLowerCase()].type}`) {
    case taskTypes.CLICKHOUSE_SQL_QUERY:
      return Builders.clickhouseBuilder(ops?.databases);
    case taskTypes.CLOUDWATCH_LOG_GROUP:
      return Builders.cloudwatchLogGroupBuilder(ops?.regions, task);
    case taskTypes.CLOUDWATCH_METRIC:
      return Builders.cloudwatchMetricBuilder(ops?.namespaces, task);
    case taskTypes.DATADOG_SERVICE_METRIC_EXECUTION:
      return Builders.datadogBuilder(ops?.services, task);
    case taskTypes.GRAFANA_PROMETHEUS_DATASOURCE:
      return Builders.grafanaDataSourceBuilder(
        ops?.prometheus_datasources,
        task,
      );
    case taskTypes.NEW_RELIC_NRQL_METRIC_EXECUTION:
      return Builders.newRelicNRQLBuilder();
    case taskTypes.AZURE_FILTER_LOG_EVENTS:
      return Builders.azureLogsBuilder(ops?.workspaces, task);
    case taskTypes.NEW_RELIC_ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION:
      return Builders.newRelicEntityApplicationBuilder(
        ops?.application_names,
        task,
      );
    case taskTypes.NEW_RELIC_ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION:
      return Builders.newRelicEntityDashboardBuilder(ops?.dashboards, task);
    case taskTypes.POSTGRES_SQL_QUERY:
      return Builders.postgresBuilder();
    case taskTypes.EKS_GET_DEPLOYMENTS:
      return Builders.eksBuilder(ops?.regions, task);
    case taskTypes.EKS_GET_EVENTS:
      return Builders.eksBuilder(ops?.regions, task);
    case taskTypes.EKS_GET_PODS:
      return Builders.eksBuilder(ops?.regions, task);
    case taskTypes.EKS_GET_SERVICES:
      return Builders.eksBuilder(ops?.regions, task);
    case taskTypes.GKE_GET_DEPLOYMENTS:
      return Builders.gkeBuilder(ops?.zones, task);
    case taskTypes.GKE_GET_EVENTS:
      return Builders.gkeBuilder(ops?.zones, task);
    case taskTypes.GKE_GET_PODS:
      return Builders.gkeBuilder(ops?.zones, task);
    case taskTypes.GKE_GET_SERVICES:
      return Builders.gkeBuilder(ops?.zones, task);
    case taskTypes.BASH_COMMAND:
      return Builders.bashBuilder(ops?.ssh_servers);
    case taskTypes.DATADOG_QUERY_METRIC_EXECUTION:
      return Builders.datadogRawQueryBuilder(task, currentStepId!);
    case taskTypes.API_HTTP_REQUEST:
      return Builders.apiBuilder();
    case taskTypes.SQL_DATABASE_CONNECTION_SQL_QUERY:
      return Builders.sqlRawQueryBuilder();
    case taskTypes.GRAFANA_MIMIR_PROMQL_METRIC_EXECUTION:
      return Builders.mimirBuilder();
    case taskTypes.DOCUMENTATION_IFRAME:
      return Builders.iframeBuilder(task);
    case taskTypes.GRAFANA_LOKI_QUERY_LOGS:
      return Builders.grafanaLokiBuilder();
    case taskTypes.ELASTIC_SEARCH_QUERY_LOGS:
      return Builders.elasticSearchBuilder(ops?.indexes);
    case taskTypes.GCM_METRIC_EXECUTION:
      return Builders.gcmMetricsBuilder(ops?.metricTypes);
    case taskTypes.GCM_FILTER_LOG_ENTRIES:
      return Builders.gcmLogsBuilder(ops?.namespaces, task);
    default:
      break;
  }
  return [];
};
