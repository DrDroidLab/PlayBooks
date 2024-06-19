import { taskTypes } from "../../constants/taskTypes.ts";
import { Step } from "../../types.ts";
import { addConditionToEdgeByIndex } from "./addConditionToEdgeByIndex.ts";

function handleTaskTypeOptions(step: Step, edgeIndex: number) {
  const type = `${step.source} ${step.taskType}`;
  let options: any = [];

  switch (type) {
    case taskTypes.CLOUDWATCH_METRIC:
      options = step?.metric ?? [];
      break;

    case taskTypes.DATADOG_SERVICE_METRIC_EXECUTION:
      options = step?.datadogMetric ?? [];
      break;

    case taskTypes.NEW_RELIC_ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION:
      options = step.golden_metrics ?? [];
      break;

    case taskTypes.NEW_RELIC_ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION:
      options =
        step.widget?.map((e) => ({
          id: e?.widget_id,
          label: e?.widget_title ?? e?.widget_nrql_expression,
        })) ?? [];
      break;

    default:
      options = [
        {
          id: step.description,
          label: step.description,
        },
      ];
      break;
  }

  addConditionToEdgeByIndex("task", options[0].id, edgeIndex, 0);

  return options;
}

export default handleTaskTypeOptions;
