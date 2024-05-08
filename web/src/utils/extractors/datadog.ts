import { models } from "../../constants/index.ts";

export const extracDatadogTasks = (step: any) => {
  let stepSource = "DATADOG";
  let selected = "";
  let modelType = "";
  const tasks = step.tasks;
  const datadogTask = tasks[0]?.metric_task?.datadog_task;

  switch (datadogTask.type) {
    case "SERVICE_METRIC_EXECUTION":
      selected = "DATADOG Service";
      modelType = models.DATADOG;
      break;
    case "QUERY_METRIC_EXECUTION":
      selected = "DATADOG Custom Query";
      modelType = models.DATADOG_QUERY;
      break;
    default:
      break;
  }

  const stepData = {
    source: stepSource,
    selectedSource: selected,
    connector_type: stepSource,
    model_type: modelType,
    modelType,
    datadogService: {
      name: datadogTask?.service_metric_execution_task?.service_name,
    },
    datadogMetricFamily:
      datadogTask?.service_metric_execution_task?.metric_family,
    datadogEnvironment:
      datadogTask?.service_metric_execution_task?.environment_name,
    datadogMetric: tasks.map((ddTask) => {
      const datadogTask = ddTask?.metric_task?.datadog_task;
      return {
        id: datadogTask?.service_metric_execution_task?.metric,
        label: datadogTask?.service_metric_execution_task?.metric,
      };
    }),
    query1: datadogTask?.query_metric_execution_task?.queries[0],
    query2: datadogTask?.query_metric_execution_task?.queries[1],
    formula: datadogTask?.query_metric_execution_task?.formula,
    requiresFormula: datadogTask?.query_metric_execution_task?.formula,
  };

  return stepData;
};
