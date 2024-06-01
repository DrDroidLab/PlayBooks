import { models } from "../../constants/index.ts";

export const extracDatadogTasks = (step: any) => {
  let stepSource = "DATADOG";
  let modelType = "";
  const tasks = step.tasks;
  console.log("step", step);
  const taskType = tasks[0][stepSource.toLowerCase()]?.type;
  const datadogTask =
    tasks[0][stepSource.toLowerCase()][taskType.toLowerCase()];
  const connectorType =
    tasks[0]?.task_connector_sources?.length > 0
      ? tasks[0]?.task_connector_sources[0]?.id
      : "";

  switch (taskType) {
    case "SERVICE_METRIC_EXECUTION":
      modelType = models.DATADOG;
      break;
    case "QUERY_METRIC_EXECUTION":
      modelType = models.DATADOG_QUERY;
      break;
    default:
      break;
  }

  const stepData = {
    source: stepSource,
    connector_type: stepSource,
    taskType,
    modelType,
    connectorType,
    datadogService: datadogTask?.service_name,
    datadogMetricFamily: datadogTask?.metric_family,
    datadogEnvironment: datadogTask?.environment_name,
    datadogMetric: tasks.map(() => {
      return {
        id: datadogTask?.metric,
        label: datadogTask?.metric,
      };
    }),
    query1: datadogTask?.queries?.length > 0 ? datadogTask?.queries[0] : "",
    query2: datadogTask?.queries?.length > 1 ? datadogTask?.queries[1] : "",
    formula: datadogTask?.formula,
    requiresFormula: datadogTask?.formula,
  };

  return stepData;
};
