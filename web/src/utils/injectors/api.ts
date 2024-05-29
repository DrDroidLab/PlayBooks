import { PlaybookTask, Step } from "../../types.ts";

export const injectApiTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let api_call_task = {
    method: step.action?.method?.toUpperCase(),
    url: step.action?.url,
    headers: step.action?.headers ? step.action?.headers : "{}",
    payload: step.action?.payload ? step.action?.payload : "{}",
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
