import { PlaybookTask, Step } from "../../types.ts";

export const injectNewRelicNrqlTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let new_relic_task = {
    source: step.source,
    type: "NRQL_METRIC_EXECUTION",
    nrql_metric_execution_task: {
      metric_name: step.nrqlData?.metric_name,
      unit: step.nrqlData?.unit,
      nrql_expression: step.nrqlData?.nrql_expression,
      process_function: "timeseries",
    },
  };

  return [
    {
      ...baseTask,
      type: "METRIC",
      metric_task: new_relic_task,
    },
  ];
};
