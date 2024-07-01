export const extractElasticSearchTasks = (step: any) => {
  let stepSource = "ELASTIC_SEARCH";
  let modelType = "ELASTIC_SEARCH_INDEX";
  const tasks = step.tasks;
  const taskType = tasks[0][stepSource.toLowerCase()]?.type;
  const elasticSearchTask =
    tasks[0][stepSource.toLowerCase()][taskType.toLowerCase()];
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
    index: elasticSearchTask?.index,
    query: elasticSearchTask?.query,
  };

  return stepData;
};
