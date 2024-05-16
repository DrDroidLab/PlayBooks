import { PlaybookTask, Step } from "../../types.ts";

export const injectCloudwatchMetricTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  const tasks = step.metric.map((e) => {
    let cloudwatch_task = {
      type: "METRIC_EXECUTION",
      metric_execution_task: {
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
      },
    };

    return cloudwatch_task;
  });

  return tasks.map((task) => ({
    ...baseTask,
    source: "CLOUDWATCH",
    cloudwatch_task: task,
    type: "METRIC",
  }));
};
