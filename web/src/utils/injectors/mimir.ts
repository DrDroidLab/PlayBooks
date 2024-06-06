import { PlaybookTask, Step } from "../../types.ts";

export const injectMimirTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let task = {
    promql_expression: step.promql_expression,
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
