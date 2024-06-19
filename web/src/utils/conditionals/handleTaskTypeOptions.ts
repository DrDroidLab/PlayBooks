import { taskTypes } from "../../constants/taskTypes.ts";
import { Step } from "../../types.ts";

function handleTaskTypeOptions(step: Step) {
  const type = `${step.source} ${step.taskType}`;

  switch (type) {
    case taskTypes.CLOUDWATCH_METRIC:
      return step?.metric ?? [];

    case taskTypes.DATADOG_SERVICE_METRIC_EXECUTION:
      return step?.datadogMetric ?? [];

    case taskTypes.NEW_RELIC_ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION:
      return step.golden_metrics ?? [];

    case taskTypes.NEW_RELIC_ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION:
      return (
        step.widget?.map((e) => ({
          id: e?.widget_id,
          label: e?.widget_title ?? e?.widget_nrql_expression,
        })) ?? []
      );

    default:
      return [
        {
          id: step.description,
          label: step.description,
        },
      ];
  }
}

export default handleTaskTypeOptions;
