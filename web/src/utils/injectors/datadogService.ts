import { PlaybookTask, Step } from "../../types.ts";

export const injectDatadogServiceTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  const tasks = (step.datadogMetric ?? []).map((metric) => ({
    service_name: step.datadogService?.name,
    environment_name: step?.datadogEnvironment ?? "",
    metric: metric ?? "",
    metric_family: step.datadogMetricFamily ?? "",
    process_function: "timeseries",
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
