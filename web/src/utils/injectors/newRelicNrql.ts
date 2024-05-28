import { PlaybookTask, Step } from "../../types.ts";

export const injectNewRelicNrqlTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let task = {
    metric_name: step.nrqlData?.metric_name,
    unit: step.nrqlData?.unit,
    nrql_expression: step.nrqlData?.nrql_expression,
    process_function: "timeseries",
  };

  return [
    {
      ...baseTask,
      [step.source?.toLowerCase()]: {
        type: step.taskType,
        [(step.taskType ?? "").toLowerCase()]: task,
      },
    },
  ];
};
