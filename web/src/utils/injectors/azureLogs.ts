import { PlaybookTask, Step } from "../../types.ts";

export const injectAzureLogTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let task = {
    workspace_id: step.workspaceId!,
    filter_query: step.filter_query!,
    timespan: step.timespan!,
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
