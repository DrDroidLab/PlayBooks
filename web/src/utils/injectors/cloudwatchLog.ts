import { PlaybookTask, Step } from "../../types/index.ts";

export const injectCloudwatchLogTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let metric_task = {
    source: "CLOUDWATCH",
    cloudwatch_task: {
      type: "FILTER_LOG_EVENTS",
      filter_log_events_task: {
        region: step.region!,
        log_group_name: step.logGroup!,
        filter_query: step.cw_log_query!,
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
