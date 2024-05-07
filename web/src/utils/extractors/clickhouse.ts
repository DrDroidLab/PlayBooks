export const extractClickhouseTasks = (step: any) => {
  let stepSource = "CLICKHOUSE";
  let modelType = "CLICKHOUSE_DATABASE";
  let selected = "CLICKHOUSE Database";
  const tasks = step.tasks;
  const clickhouseTask = tasks[0].data_fetch_task?.clickhouse_data_fetch_task;

  const stepData = {
    source: stepSource,
    selectedSource: selected,
    connector_type: stepSource,
    model_type: modelType,
    modelType,
    database: clickhouseTask.database,
    dbQuery: clickhouseTask.query,
  };

  return stepData;
};
