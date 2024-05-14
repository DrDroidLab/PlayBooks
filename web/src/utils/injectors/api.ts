import { PlaybookTask, Step } from "../../types/index.ts";

export const injectApiTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let api_call_task = {
    method: step.action?.method?.toUpperCase(),
    url: step.action?.url,
    headers: JSON.parse(step.action?.headers ?? "{}"),
    payload: JSON.parse(step.action?.payload ?? "{}"),
    timeout: step.action?.timeout,
  };

  return [
    {
      ...baseTask,
      type: "ACTION",
      action_task: {
        source: step.source.toUpperCase(),
        api_call_task,
      },
    },
  ];
};
