import { PlaybookTask } from "../../types.ts";
import { Step } from "../../types/index.ts";

export const injectNewRelicNrqlTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let metric_task = {
    source: step.source,
    new_relic_task: {
      type: "NRQL_METRIC_EXECUTION",
      nrql_metric_execution_task: {
        metric_name: step.nrqlData?.metric_name,
        unit: step.nrqlData?.unit,
        nrql_expression: step.nrqlData?.nrql_expression,
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
