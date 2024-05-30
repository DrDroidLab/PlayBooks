import { PlaybookTask, Step } from "../../types.ts";

export const injectCloudwatchMetricTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  const tasks = step.metric.map((e) => ({
    namespace: step.namespaceName ?? step.namespace!,
    metric_name: e.id!,
    region: step.region!,
    process_function: "timeseries",
    statistic: "Average",
    dimensions: [
      {
        name: step.dimensionName!,
        value: step.dimensionValue!,
      },
    ],
  }));

  return tasks.map((task) => ({
    ...baseTask,
    [step.source?.toLowerCase()]: {
      type: step.taskType,
      [(step.taskType ?? "").toLowerCase()]: task,
    },
    type: "METRIC",
  }));
};
