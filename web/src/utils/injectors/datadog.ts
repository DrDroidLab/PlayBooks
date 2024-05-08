import { models } from "../../constants/index.ts";
import { PlaybookTask, Step } from "../../types.ts";
import { injectDatadogQueryTasks } from "./datadogQuery.ts";
import { injectDatadogServiceTasks } from "./datadogService.ts";

export const injectDatadogTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let tasks: PlaybookTask[] = [];
  switch (step.modelType) {
    case models.DATADOG:
      tasks = injectDatadogServiceTasks(step, baseTask);
      break;
    case models.DATADOG_QUERY:
      tasks = injectDatadogQueryTasks(step, baseTask);
      break;
  }

  return tasks;
};
