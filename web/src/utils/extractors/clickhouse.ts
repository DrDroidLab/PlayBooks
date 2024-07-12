export const extractClickhouseTasks = (step: any) => {
  let stepSource = "CLICKHOUSE";
  let modelType = "CLICKHOUSE_DATABASE";
  const tasks = step.tasks;
  const taskType = tasks[0][stepSource.toLowerCase()]?.type;
  const clickhouseTask =
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
    database: clickhouseTask.database,
    dbQuery: clickhouseTask.query,
    timeout: step.timeout!,
  };

  return stepData;
};
