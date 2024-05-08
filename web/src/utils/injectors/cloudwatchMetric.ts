import { PlaybookTask, Step } from "../../types.ts";

export const injectCloudwatchMetricTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  const tasks = step.metric.map((e) => {
    let metric_task = {
      source: "CLOUDWATCH",
      cloudwatch_task: {
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
      },
    };

    return metric_task;
  });

  return tasks.map((task) => ({
    ...baseTask,
    metric_task: task,
    type: "METRIC",
  }));
};
