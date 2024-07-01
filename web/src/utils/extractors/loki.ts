export const extractLokiTasks = (step: any) => {
  let stepSource = "GRAFANA_LOKI";
  let modelType = "GRAFANA_LOKI";
  const tasks = step.tasks;
  const taskType = tasks[0][stepSource?.toLowerCase()]?.type;
  const lokiStep = tasks[0][stepSource?.toLowerCase()][taskType.toLowerCase()];
  const connectorType =
    tasks[0]?.task_connector_sources?.length > 0
      ? tasks[0]?.task_connector_sources[0]?.id
      : "";

  const stepData = {
    source: stepSource,
    connector_type: stepSource,
    taskType,
    modelType,
    connectorType,
    query: lokiStep?.query,
    start_time: lokiStep?.start_time,
    end_time: lokiStep?.end_time,
  };

  return stepData;
};
