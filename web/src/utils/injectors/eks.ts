import { PlaybookTask, Step } from "../../types.ts";

export const injectEksTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let task = {
    region: step.eksRegion!,
    cluster: step.cluster!,
    namespace: step.eksNamespace!,
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
