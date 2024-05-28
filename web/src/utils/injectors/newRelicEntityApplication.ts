import { PlaybookTask, Step } from "../../types.ts";

export const injectNewRelicEntityApplicationTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  const tasks = (step.golden_metrics ?? []).map((golden_metric) => ({
    application_entity_guid: step?.assets?.application_entity_guid,
    application_entity_name: step?.assets?.application_name,
    golden_metric_name: golden_metric.metric?.golden_metric_name,
    golden_metric_unit: golden_metric.metric?.golden_metric_unit,
    golden_metric_nrql_expression:
      golden_metric.metric?.golden_metric_nrql_expression,
    process_function: "timeseries",
  }));

  return tasks.map((task) => ({
    ...baseTask,
    [step.source?.toLowerCase()]: {
      type: step.taskType,
      [(step.taskType ?? "").toLowerCase()]: task,
    },
    type: "METRIC",
  }));
};
