import { PlaybookTask, Step } from "../../types.ts";

export const injectClickhouseTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let task = {
    database: step.database!,
    query: step.dbQuery!,
    timeout: step.timeout!,
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
