export const extractApiTasks = (step: any) => {
  let stepSource = "API";
  let modelType = "API";
  let selected = "API";
  const tasks = step.tasks;
  const taskType = tasks[0][stepSource.toLowerCase()]?.type;
  const connectorType =
    tasks[0]?.task_connector_sources?.length > 0
      ? tasks[0]?.task_connector_sources[0]?.id
      : "";
  const apiTask = tasks[0][stepSource.toLowerCase()][taskType.toLowerCase()];

  const stepData = {
    source: stepSource,
    selectedSource: selected,
    connector_type: stepSource,
    model_type: modelType,
    connectorType,
    taskType,
    modelType,
    action: {
      method: apiTask.method,
      url: apiTask.url,
      headers: apiTask.headers ?? "{}",
      timeout: apiTask.timeout,
      payload: apiTask.payload ?? "{}",
    },
  };

  return stepData;
};
