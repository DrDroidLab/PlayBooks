import { taskTypes } from "../../constants/taskTypes.ts";
import { Step } from "../../types.ts";

function handleTaskTypeOptions(step: Step) {
  const type = `${step.source} ${step.taskType}`;
  let options: any = [];

  switch (type) {
    case taskTypes.CLOUDWATCH_METRIC:
      options =
        step?.metric?.map((e, i) => ({
          id: `${i}`,
          label: e.label,
        })) ?? [];
      break;

    case taskTypes.DATADOG_SERVICE_METRIC_EXECUTION:
      options =
        step?.datadogMetric?.map((e, i) => ({
          id: `${i}`,
          label: e.label,
        })) ?? [];
      break;

    case taskTypes.NEW_RELIC_ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION:
      options =
        step.golden_metrics?.map((e, i) => ({
          id: `${i}`,
          label: e.label,
        })) ?? [];
      break;

    case taskTypes.NEW_RELIC_ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION:
      options =
        step.widget?.map((e, i) => ({
          id: `${i}`,
          label: e?.widget_title ?? e?.widget_nrql_expression,
        })) ?? [];
      break;

    default:
      options = [
        {
          id: "0",
          label: step.description ?? step.taskType,
        },
      ];
      break;
  }

  return options;
}

export default handleTaskTypeOptions;
