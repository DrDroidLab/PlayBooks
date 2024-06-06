export const extractGkeTasks = (step: any) => {
  let stepSource = "GKE";
  let modelType = "GKE_CLUSTER";
  const tasks = step.tasks;
  const taskType = tasks[0][stepSource.toLowerCase()]?.type;
  const gkeTask = tasks[0][stepSource.toLowerCase()][taskType.toLowerCase()];
  const connectorType =
    tasks[0]?.task_connector_sources?.length > 0
      ? tasks[0]?.task_connector_sources[0]?.id
      : "";

  const stepData = {
    source: stepSource,
    connector_type: stepSource,
    connectorType,
    taskType,
    modelType,
    region: gkeTask?.region,
    cluster: gkeTask?.cluster,
    namespace: gkeTask?.namespace,
  };

  return stepData;
};
