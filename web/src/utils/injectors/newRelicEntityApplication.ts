import { PlaybookTask, Step } from "../../types.ts";

export const injectNewRelicEntityApplicationTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  const tasks = (step.golden_metrics ?? []).map((golden_metric) => {
    let new_relic_task = {
      type: "ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION",
      entity_application_golden_metric_execution_task: {
        application_entity_guid: step?.assets?.application_entity_guid,
        application_entity_name: step?.assets?.application_name,
        golden_metric_name: golden_metric.metric?.golden_metric_name,
        golden_metric_unit: golden_metric.metric?.golden_metric_unit,
        golden_metric_nrql_expression:
          golden_metric.metric?.golden_metric_nrql_expression,
        process_function: "timeseries",
      },
    };

    return new_relic_task;
  });

  return tasks.map((task) => ({
    ...baseTask,
    new_relic_task: task,
    type: "METRIC",
  }));
};
