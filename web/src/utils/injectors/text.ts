import { PlaybookTask, Step } from "../../types.ts";

export const injectTextTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {

  let documentation_task = {
    type: "MARKDOWN",
    source: step.source.toUpperCase(),
    documentation: step.notes!,
    iframe_url: step.iframe_url!,
  };

  if (step.modelType == 'IFRAME') {
    documentation_task['type'] = "IFRAME";
  }  

  return [
    {
      ...baseTask,
      type: "DOCUMENTATION",
      documentation_task: documentation_task,
    },
  ];

  return []

  
};
