import { PlaybookTask, Step } from "../../types.ts";

export const injectAzureLogTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let metric_task = {
    source: "AZURE",
    azure_task: {
      type: "FILTER_LOG_EVENTS",
      filter_log_events_task: {
        workspace_id: step.workspaceId!,
        filter_query: step.filter_query!,
        timespan: step.timespan!,
      },
    },
  };

  return [
    {
      ...baseTask,
      type: "METRIC",
      metric_task,
    },
  ];
};
