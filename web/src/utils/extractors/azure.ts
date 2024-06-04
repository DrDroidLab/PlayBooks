export const extractAzureTasks = (step: any) => {
  console.log("Step", step);
  let stepSource = "AZURE";
  let modelType = "";
  const tasks = step.tasks;
  const taskType = tasks[0][stepSource?.toLowerCase()]?.type;
  const azureStep = tasks[0][stepSource?.toLowerCase()][taskType.toLowerCase()];
  const connectorType =
    tasks[0]?.task_connector_sources?.length > 0
      ? tasks[0]?.task_connector_sources[0]?.id
      : "";

  switch (azureStep.type) {
    case "FILTER_LOG_EVENTS":
      modelType = "AZURE_WORKSPACE";
  }

  const stepData = {
    source: stepSource,
    connector_type: stepSource,
    taskType,
    modelType,
    connectorType,
    workspaceId: azureStep?.workspace_id,
    filter_query: azureStep?.filter_query,
    timespan: azureStep?.timespan,
  };

  return stepData;
};
