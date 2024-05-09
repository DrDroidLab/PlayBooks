import { PlaybookTask, Step } from "../../types.ts";

export const injectTextTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let documentation_task = {
    type: "MARKDOWN",
    documentation: step.notes!,
  };

  return [
    {
      ...baseTask,
      type: "DOCUMENTATION",
      documentation_task: documentation_task,
    },
  ];
};
