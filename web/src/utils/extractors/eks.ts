export const extractEksTasks = (step: any) => {
  let stepSource = "EKS";
  let modelType = "EKS_CLUSTER";
  let selected = "EKS Cluster";
  const tasks = step.tasks;
  const eksTask = tasks[0]?.eks_data_fetch_task;

  const stepData = {
    source: stepSource,
    selectedSource: selected,
    connector_type: stepSource,
    model_type: modelType,
    modelType,
    eksRegion: eksTask?.region,
    cluster: eksTask?.cluster,
    eksNamespace: eksTask?.namespace,
    command: {
      type: eksTask?.command_type,
      description: eksTask?.description,
    },
  };

  return stepData;
};
