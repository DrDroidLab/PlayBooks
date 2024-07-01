import { taskTypes } from "../constants/index.ts";
import * as Builders from "./builders/index.ts";
import getCurrentTask from "./getCurrentTask.ts";

export enum OptionType {
  OPTIONS = "options",
  TEXT = "text",
  TEXT_ROW = "text-row",
  MULTILINE = "multiline",
  BUTTON = "button",
  MULTI_OPTIONS = "multi-options",
  MULTI_SELECT = "multi-select",
  TYPING_DROPDOWN = "typing-dropdown",
  IFRAME_RENDER = "iframe-render",
}

export const constructBuilder = (id?: string) => {
  const [task, currentStepId] = getCurrentTask(id);

  let ops: any = task?.ui_requirement.modelOptions ?? [];

  switch (`${task?.source} ${task?.[task.source?.toLowerCase()].type}`) {
    case taskTypes.CLICKHOUSE_SQL_QUERY:
      return Builders.clickhouseBuilder(ops?.databases, task);
    case taskTypes.CLOUDWATCH_LOG_GROUP:
      return Builders.cloudwatchLogGroupBuilder(ops?.regions, task);
    case taskTypes.CLOUDWATCH_METRIC:
      return Builders.cloudwatchMetricBuilder(ops?.namespaces, task);
    case taskTypes.DATADOG_SERVICE_METRIC_EXECUTION:
      return Builders.datadogBuilder(ops?.services, task, currentStepId!);
    // case taskTypes.GRAFANA_VPC_PROMQL_METRIC_EXECUTION:
    // case taskTypes.GRAFANA_PROMQL_METRIC_EXECUTION:
    //   return Builders.grafanaBuilder(ops?.dashboards, task);
    case taskTypes.GRAFANA_PROMETHEUS_DATASOURCE:
      return Builders.grafanaDataSourceBuilder(
        ops?.prometheus_datasources,
        task,
        currentStepId!,
      );
    case taskTypes.NEW_RELIC_NRQL_METRIC_EXECUTION:
      return Builders.newRelicNRQLBuilder(task, currentStepId);
    case taskTypes.AZURE_FILTER_LOG_EVENTS:
      return Builders.azureLogsBuilder(ops?.workspaces, task, currentStepId!);
    case taskTypes.NEW_RELIC_ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION:
      return Builders.newRelicEntityApplicationBuilder(
        ops?.application_names,
        task,
        currentStepId,
      );
    case taskTypes.NEW_RELIC_ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION:
      return Builders.newRelicEntityDashboardBuilder(
        ops?.dashboards,
        task,
        currentStepId!,
      );
    case taskTypes.POSTGRES_SQL_QUERY:
      return Builders.postgresBuilder();
    case taskTypes.EKS_GET_DEPLOYMENTS:
      return Builders.eksBuilder(ops?.regions, task, currentStepId);
    case taskTypes.EKS_GET_EVENTS:
      return Builders.eksBuilder(ops?.regions, task, currentStepId);
    case taskTypes.EKS_GET_PODS:
      return Builders.eksBuilder(ops?.regions, task, currentStepId);
    case taskTypes.EKS_GET_SERVICES:
      return Builders.eksBuilder(ops?.regions, task, currentStepId);
    case taskTypes.GKE_GET_DEPLOYMENTS:
      return Builders.gkeBuilder(ops?.zones, task, currentStepId);
    case taskTypes.GKE_GET_EVENTS:
      return Builders.gkeBuilder(ops?.zones, task, currentStepId);
    case taskTypes.GKE_GET_PODS:
      return Builders.gkeBuilder(ops?.zones, task, currentStepId);
    case taskTypes.GKE_GET_SERVICES:
      return Builders.gkeBuilder(ops?.zones, task, currentStepId);
    case taskTypes.BASH_COMMAND:
      return Builders.bashBuilder(ops?.ssh_servers);
    case taskTypes.DATADOG_QUERY_METRIC_EXECUTION:
      return Builders.datadogRawQueryBuilder(task, currentStepId!);
    case taskTypes.API_HTTP_REQUEST:
      return Builders.apiBuilder(task, currentStepId);
    case taskTypes.SQL_DATABASE_CONNECTION_SQL_QUERY:
      return Builders.sqlRawQueryBuilder();
    case taskTypes.GRAFANA_MIMIR_PROMQL_METRIC_EXECUTION:
      return Builders.mimirBuilder();
    case taskTypes.DOCUMENTATION_IFRAME:
      return Builders.iframeBuilder(task);
    default:
      break;
  }
  return [];
};
