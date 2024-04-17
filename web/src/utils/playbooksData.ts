import { models } from '../constants/index.ts';
import {
  clickhouseBuilder,
  cloudwatchLogGroupBuilder,
  cloudwatchMetricBuilder,
  datadogBuilder,
  grafanaBuilder,
  newRelicEntityApplicationBuilder,
  newRelicEntityDashboardBuilder,
  newRelicNRQLBuilder,
  postgresBuilder,
  eksBuilder
} from './builders/index.ts';

export enum OptionType {
  OPTIONS = 'options',
  TEXT = 'text',
  MULTILINE = 'multiline'
}

export const constructBuilder = (task: any, index) => {
  if (!(task?.modelTypeOptions?.length > 0)) {
    if (task.modelType === models.NEW_RELIC_NRQL) {
      return newRelicNRQLBuilder(task, index);
    }
    return [];
  }
  const ops =
    task?.modelTypeOptions[0]?.model_types_options[0]?.[
      `${task.modelType.toLowerCase()}_model_options`
    ];
  switch (task.modelType) {
    case models.CLICKHOUSE:
      return clickhouseBuilder(task, index, ops?.databases);
    case models.CLOUDWATCH_LOG_GROUP:
      return cloudwatchLogGroupBuilder(task, index, ops?.regions);
    case models.CLOUDWATCH_METRIC:
      return cloudwatchMetricBuilder(task, index, ops?.namespaces);
    case models.DATADOG:
      return datadogBuilder(task, index, ops?.services);
    case models.GRAFANA:
      return grafanaBuilder(task, index, ops?.dashboards);
    case models.NEW_RELIC_NRQL:
      return newRelicNRQLBuilder(task, index);
    case models.NEW_RELIC_ENTITY_APPLICATION:
      return newRelicEntityApplicationBuilder(task, index, ops?.application_names);
    case models.NEW_RELIC_ENTITY_DASHBOARD:
      return newRelicEntityDashboardBuilder(task, index, ops?.dashboards);
    case models.POSTGRES_DATABASE:
      return postgresBuilder(task, index, ops?.databases);
    case models.EKS_CLUSTER:
      return eksBuilder(task, index, ops?.regions);
    default:
      return [];
  }
};
