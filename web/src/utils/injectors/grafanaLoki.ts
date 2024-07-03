import { PlaybookTask, Step } from "../../types.ts";

export const injectGrafanaLokiTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let task = {
    query: step.query!,
    start_time: step.start_time!,
    end_time: step.end_time!,
    limit: step.limit!,
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
