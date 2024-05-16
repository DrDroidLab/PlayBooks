import { PlaybookTask, Step } from "../../types.ts";

export const injectMimirTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let metric_task = {
    source: step.source.toUpperCase(),
    mimir_task: {
        type: "PROMQL_METRIC_EXECUTION",
        promql_metric_execution_task: {
          promql_expression: step.promql_expression,
          process_function: "timeseries"
        }
    },
  };

  return [
    {
      ...baseTask,
      type: "METRIC",
      metric_task,
    },
  ];
};
