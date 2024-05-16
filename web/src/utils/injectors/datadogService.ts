import { PlaybookTask, Step } from "../../types.ts";

export const injectDatadogServiceTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  const tasks = (step.datadogMetric ?? []).map((metric) => {
    let datadog_task = {
      type: "SERVICE_METRIC_EXECUTION",
      service_metric_execution_task: {
        service_name: step.datadogService?.name,
        environment_name: step?.datadogEnvironment ?? "",
        metric: metric ?? "",
        metric_family: step.datadogMetricFamily ?? "",
        process_function: "timeseries",
      },
    };

    return datadog_task;
  });

  return tasks.map((task) => ({
    ...baseTask,
    source: step.source,
    datadog_task: task,
  }));
};
