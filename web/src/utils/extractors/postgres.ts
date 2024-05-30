export const extractPostgresTasks = (step: any) => {
  let stepSource = "POSTGRES";
  let modelType = "POSTGRES_DATABASE";
  let selected = "POSTGRES Database";
  const tasks = step.tasks;
  const postgresTask = tasks[0]?.postgres_data_fetch_task;

  const stepData = {
    source: stepSource,
    selectedSource: selected,
    connector_type: stepSource,
    model_type: modelType,
    modelType,
    database: postgresTask?.database,
    dbQuery: postgresTask?.query,
  };

  return stepData;
};
