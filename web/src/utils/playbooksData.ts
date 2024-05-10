import { models } from "../constants/index.ts";
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
  if (!(task?.modelTypeOptions?.length > 0)) {
    switch (task.modelType) {
      case models.NEW_RELIC_NRQL:
        return Builders.newRelicNRQLBuilder(task, index);

      case models.DATADOG_QUERY:
        return Builders.datadogRawQueryBuilder(task, index);

      case models.API:
        return Builders.apiBuilder(task, index);

      default:
        break;
    }
    return [];
  }
  let ops: any = handleModelOptions(
    task?.modelTypeOptions[0]?.model_types_options[0],
    task.modelType.toLowerCase(),
  );
  ops = handleModelOptions(
    task?.modelTypeOptions[0]?.model_types_options[0],
    task.modelType.toLowerCase(),
  );

  switch (task.modelType) {
    case models.CLICKHOUSE:
      return Builders.clickhouseBuilder(task, index, ops?.databases);
    case models.CLOUDWATCH_LOG_GROUP:
      return Builders.cloudwatchLogGroupBuilder(task, index, ops?.regions);
    case models.CLOUDWATCH_METRIC:
      return Builders.cloudwatchMetricBuilder(task, index, ops?.namespaces);
    case models.DATADOG:
      return Builders.datadogBuilder(task, index, ops?.services);
    case models.GRAFANA:
      return Builders.grafanaBuilder(task, index, ops?.dashboards);
    case models.NEW_RELIC_NRQL:
      return Builders.newRelicNRQLBuilder(task, index);
    case models.NEW_RELIC_ENTITY_APPLICATION:
      return Builders.newRelicEntityApplicationBuilder(
        task,
        index,
        ops?.application_names,
      );
    case models.NEW_RELIC_ENTITY_DASHBOARD:
      return Builders.newRelicEntityDashboardBuilder(
        task,
        index,
        ops?.dashboards,
      );
    case models.POSTGRES_DATABASE:
      return Builders.postgresBuilder(task, index, ops?.databases);
    case models.EKS_CLUSTER:
      return Builders.eksBuilder(task, index, ops?.regions);
    case models.BASH:
      return Builders.bashBuilder(task, index, ops?.ssh_servers);
    default:
      return [];
  }
};
