import { PlaybookTask, Step } from "../../types.ts";

export const injectCloudwatchLogTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let cloudwatch_task = {
    type: "FILTER_LOG_EVENTS",
    filter_log_events_task: {
      region: step.region!,
      log_group_name: step.logGroup!,
      filter_query: step.cw_log_query!,
    },
  };

  return [
    {
      ...baseTask,
      source: "CLOUDWATCH",
      cloudwatch_task,
    },
  ];
};
