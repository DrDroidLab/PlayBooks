export const extractSqlRawQueryTasks = (step: any) => {
  let stepSource = "SQL_DATABASE_CONNECTION";
  let modelType = "SQL_DATABASE_CONNECTION_RAW_QUERY";
  let selected = "SQL_DATABASE_CONNECTION Query";
  const tasks = step.tasks;
  const sqlTask =
    tasks[0].data_fetch_task?.sql_database_connection_data_fetch_task;

  const stepData = {
    source: stepSource,
    selectedSource: selected,
    connector_type: stepSource,
    model_type: modelType,
    modelType,
    query: sqlTask.query,
  };

  return stepData;
};
