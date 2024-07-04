export const extractMimirTasks = (step: any) => {
  let stepSource = "GRAFANA_MIMIR";
  let modelType = "GRAFANA_MIMIR_PROMQL";
  const tasks = step.tasks;
  const taskType = tasks[0][stepSource.toLowerCase()]?.type;
  const mimirTask = tasks[0][stepSource.toLowerCase()][taskType.toLowerCase()];
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
    promql_expression:
      mimirTask?.promql_expression,
  };

  return stepData;
};
