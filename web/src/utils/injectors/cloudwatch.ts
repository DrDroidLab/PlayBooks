import { models } from "../../constants/index.ts";
import { PlaybookTask, Step } from "../../types/index.ts";
import { injectCloudwatchLogTasks } from "./cloudwatchLog.ts";
import { injectCloudwatchMetricTasks } from "./cloudwatchMetric.ts";

export const injectCloudwatchTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let tasks: PlaybookTask[] = [];
  switch (step.modelType) {
    case models.CLOUDWATCH_METRIC:
      tasks = injectCloudwatchMetricTasks(step, baseTask);
      break;
    case models.CLOUDWATCH_LOG_GROUP:
      tasks = injectCloudwatchLogTasks(step, baseTask);
  }

  return tasks;
};
