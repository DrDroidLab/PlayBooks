import { PlaybookTask, Step } from "../../types.ts";

export const injectMimirTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let mimir_task = {
    type: "PROMQL_METRIC_EXECUTION",
    promql_metric_execution_task: {
      promql_expression: step.promql_expression,
      process_function: "timeseries",
    },
  };

  return [
    {
      ...baseTask,
      source: step.source.toUpperCase(),
      mimir_task,
    },
  ];
};
