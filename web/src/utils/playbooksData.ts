import { taskTypes } from "../constants/index.ts";
import * as Builders from "./builders/index.ts";
import getCurrentTask from "./getCurrentTask.ts";
import handleModelOptions from "./handleModelOptions.ts";

export enum OptionType {
  OPTIONS = "options",
  TEXT = "text",
  TEXT_ROW = "text-row",
  MULTILINE = "multiline",
  BUTTON = "button",
  MULTI_OPTIONS = "multi-options",
  MULTI_SELECT = "multi-select",
  TYPING_DROPDOWN = "typing-dropdown",
}

export const constructBuilder = () => {
  const [task] = getCurrentTask();
  let ops: any =
    task?.modelTypeOptions?.length > 0 &&
    task?.modelTypeOptions[0]?.model_types_options?.length > 0
      ? handleModelOptions(
          task?.modelTypeOptions[0]?.model_types_options[0],
          task?.modelType.toLowerCase(),
        )
      : [];

  switch (`${task?.source} ${task?.taskType}`) {
    case taskTypes.CLICKHOUSE_SQL_QUERY:
      return Builders.clickhouseBuilder(ops?.databases);
    case taskTypes.CLOUDWATCH_LOG_GROUP:
      return Builders.cloudwatchLogGroupBuilder(ops?.regions);
    case taskTypes.CLOUDWATCH_METRIC:
      return Builders.cloudwatchMetricBuilder(ops?.namespaces);
    case taskTypes.DATADOG_SERVICE_METRIC_EXECUTION:
      return Builders.datadogBuilder(ops?.services);
    case taskTypes.GRAFANA_PROMQL_METRIC_EXECUTION:
      return Builders.grafanaBuilder(ops?.dashboards);
    case taskTypes.NEW_RELIC_NRQL_METRIC_EXECUTION:
      return Builders.newRelicNRQLBuilder();
    case taskTypes.NEW_RELIC_ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION:
      return Builders.newRelicEntityApplicationBuilder(ops?.application_names);
    case taskTypes.NEW_RELIC_ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION:
      return Builders.newRelicEntityDashboardBuilder(ops?.dashboards);
    case taskTypes.POSTGRES_SQL_QUERY:
      return Builders.postgresBuilder(ops?.databases);
    case taskTypes.EKS_GET_DEPLOYMENTS:
      return Builders.eksBuilder(ops?.regions);
    case taskTypes.EKS_GET_EVENTS:
      return Builders.eksBuilder(ops?.regions);
    case taskTypes.EKS_GET_PODS:
      return Builders.eksBuilder(ops?.regions);
    case taskTypes.EKS_GET_SERVICES:
      return Builders.eksBuilder(ops?.regions);
    case taskTypes.BASH_COMMAND:
      return Builders.bashBuilder(ops?.ssh_servers);
    case taskTypes.DATADOG_QUERY_METRIC_EXECUTION:
      return Builders.datadogRawQueryBuilder();
    case taskTypes.API_HTTP_REQUEST:
      return Builders.apiBuilder();
    case taskTypes.SQL_DATABASE_CONNECTION_SQL_QUERY:
      return Builders.sqlRawQueryBuilder();
    case taskTypes.GRAFANA_MIMIR_PROMQL_METRIC_EXECUTION:
      return Builders.mimirBuilder();
    default:
      return [];
  }
};
