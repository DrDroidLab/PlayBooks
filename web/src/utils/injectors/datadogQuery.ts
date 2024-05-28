import { PlaybookTask, Step } from "../../types.ts";

export const injectDatadogQueryTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let task = {
    queries: step.query2 ? [step.query1!, step.query2] : [step.query1!],
    formula: step.formula!,
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
