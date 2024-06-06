import { PlaybookTask, Step } from "../../types.ts";

export const injectCloudwatchLogTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let task = {
    region: step.region!,
    log_group_name: step.logGroup!,
    filter_query: step.cw_log_query!,
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
