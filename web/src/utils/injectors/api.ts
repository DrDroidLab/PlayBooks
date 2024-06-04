import { PlaybookTask, Step } from "../../types.ts";

export const injectApiTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let task = {
    method: step.action?.method?.toUpperCase(),
    url: step.action?.url,
    headers: JSON.parse(step.action?.headers ?? "{}"),
    payload: JSON.parse(step.action?.payload ?? "{}"),
    timeout: step.action?.timeout,
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
