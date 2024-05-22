import { taskTypes } from "../constants/index.ts";
import * as Builders from "./builders/index.ts";
import handleModelOptions from "./handleModelOptions.ts";

export enum OptionType {
  OPTIONS = "options",
  TEXT = "text",
  TEXT_ROW = "text-row",
  MULTILINE = "multiline",
  BUTTON = "button",
  MULTI_OPTIONS = "multi-options",
  MULTI_SELECT = "multi-select",
}

export const constructBuilder = (task: any, index) => {
  let ops: any =
    task?.modelTypeOptions?.length > 0
      ? handleModelOptions(
          task?.modelTypeOptions[0]?.model_types_options[0],
          task.modelType.toLowerCase(),
        )
      : [];

  switch (`${task.source} ${task.taskType}`) {
    case taskTypes.CLICKHOUSE_SQL_QUERY:
      return Builders.clickhouseBuilder(task, index, ops?.databases);
    case taskTypes.CLOUDWATCH_LOG_GROUP:
      return Builders.cloudwatchLogGroupBuilder(task, index, ops?.regions);
    case taskTypes.CLOUDWATCH_METRIC:
      return Builders.cloudwatchMetricBuilder(task, index, ops?.namespaces);
    case taskTypes.DATADOG_SERVICE_METRIC_EXECUTION:
      return Builders.datadogBuilder(task, index, ops?.services);
    case taskTypes.GRAFANA_PROMQL_METRIC_EXECUTION:
      return Builders.grafanaBuilder(task, index, ops?.dashboards);
    case taskTypes.NEW_RELIC_NRQL_METRIC_EXECUTION:
      return Builders.newRelicNRQLBuilder(task, index);
    case taskTypes.NEW_RELIC_ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION:
      return Builders.newRelicEntityApplicationBuilder(
        task,
        index,
        ops?.application_names,
      );
    case taskTypes.NEW_RELIC_ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION:
      return Builders.newRelicEntityDashboardBuilder(
        task,
        index,
        ops?.dashboards,
      );
    case taskTypes.POSTGRES_SQL_QUERY:
      return Builders.postgresBuilder(task, index, ops?.databases);
    case taskTypes.EKS_GET_DEPLOYMENTS:
      return Builders.eksBuilder(task, index, ops?.regions);
    case taskTypes.EKS_GET_EVENTS:
      return Builders.eksBuilder(task, index, ops?.regions);
    case taskTypes.EKS_GET_PODS:
      return Builders.eksBuilder(task, index, ops?.regions);
    case taskTypes.EKS_GET_SERVICES:
      return Builders.eksBuilder(task, index, ops?.regions);
    case taskTypes.BASH_COMMAND:
      return Builders.bashBuilder(task, index, ops?.ssh_servers);
    case taskTypes.DATADOG_QUERY_METRIC_EXECUTION:
      return Builders.datadogRawQueryBuilder(task, index);
    case taskTypes.API_HTTP_REQUEST:
      return Builders.apiBuilder(task, index);
    case taskTypes.SQL_DATABASE_CONNECTION_SQL_QUERY:
      return Builders.sqlRawQueryBuilder(task, index);
    case taskTypes.GRAFANA_MIMIR_PROMQL_METRIC_EXECUTION:
      return Builders.mimirBuilder(task, index);
    default:
      return [];
  }
};
