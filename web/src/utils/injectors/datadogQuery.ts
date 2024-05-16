import { PlaybookTask, Step } from "../../types.ts";

export const injectDatadogQueryTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let datadog_task = {
    type: "QUERY_METRIC_EXECUTION",
    query_metric_execution_task: {
      queries: step.query2 ? [step.query1!, step.query2] : [step.query1!],
      formula: step.formula!,
      process_function: "timeseries",
    },
  };

  return [
    {
      ...baseTask,
      source: "DATADOG",
      datadog_task,
    },
  ];
};
