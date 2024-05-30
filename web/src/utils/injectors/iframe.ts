import { PlaybookTask, Step } from "../../types.ts";

export const injectIframeTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let documentation_task = {
    type: "MARKDOWN",
    iframe_url: step.iframe_url!,
  };

  return [
    {
      ...baseTask,
      type: "DOCUMENTATION",
      documentation_task: documentation_task,
    },
  ];
};
