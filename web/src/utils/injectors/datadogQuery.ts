import { PlaybookTask } from "../../types.ts";
import { Step } from "../../types/index.ts";

export const injectDatadogQueryTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let metric_task = {
    source: "DATADOG",
    datadog_task: {
      type: "QUERY_METRIC_EXECUTION",
      query_metric_execution_task: {
        queries: step.query2 ? [step.query1!, step.query2] : [step.query1!],
        formula: step.formula!,
        process_function: "timeseries",
      },
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
