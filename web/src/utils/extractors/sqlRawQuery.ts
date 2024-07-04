export const extractSqlRawQueryTasks = (step: any) => {
  let stepSource = "SQL_DATABASE_CONNECTION";
  let modelType = "SQL_DATABASE_CONNECTION_RAW_QUERY";
  const tasks = step.tasks;
  const taskType = tasks[0][stepSource.toLowerCase()]?.type;
  const sqlTask = tasks[0][stepSource.toLowerCase()][taskType.toLowerCase()];
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
    query: sqlTask.query,
  };

  return stepData;
};
