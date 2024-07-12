export const extractPostgresTasks = (step: any) => {
  let stepSource = "POSTGRES";
  let modelType = "POSTGRES_DATABASE";
  const tasks = step.tasks;
  const taskType = tasks[0][stepSource.toLowerCase()]?.type;
  const postgresTask =
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
    database: postgresTask?.database,
    dbQuery: postgresTask?.query,
    timeout: postgresTask?.timeout,
  };

  return stepData;
};
