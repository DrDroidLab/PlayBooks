export const extractEksTasks = (step: any) => {
  let stepSource = "EKS";
  let modelType = "EKS_CLUSTER";
  const tasks = step.tasks;
  const taskType = tasks[0][stepSource.toLowerCase()]?.type;
  const eksTask = tasks[0][stepSource.toLowerCase()][taskType.toLowerCase()];
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
    eksRegion: eksTask?.region,
    cluster: eksTask?.cluster,
    eksNamespace: eksTask?.namespace,
  };

  return stepData;
};
