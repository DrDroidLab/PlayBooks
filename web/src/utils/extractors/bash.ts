export const extractBashTasks = (step: any) => {
  let stepSource = "BASH";
  let modelType = "SSH_SERVER";
  const tasks = step.tasks;
  const taskType = tasks[0][stepSource.toLowerCase()]?.type;
  const connectorType =
    tasks[0]?.task_connector_sources?.length > 0
      ? tasks[0]?.task_connector_sources[0]?.id
      : "";
  const bashTask = tasks[0][stepSource.toLowerCase()][taskType.toLowerCase()];

  const stepData = {
    source: stepSource,
    connector_type: stepSource,
    model_type: modelType,
    connectorType,
    taskType,
    modelType,
    command: bashTask.command,
    remote_server: bashTask.remote_server,
  };

  return stepData;
};
