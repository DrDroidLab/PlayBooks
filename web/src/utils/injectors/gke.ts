import { PlaybookTask, Step } from "../../types.ts";

export const injectGkeTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let task = {
    zone: step.zone!,
    cluster: step.cluster!,
    namespace: step.namespace!,
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
