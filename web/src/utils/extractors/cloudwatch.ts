export const extractCloudwatchTasks = (step: any) => {
  let stepSource = "CLOUDWATCH";
  let modelType = "";
  const tasks = step.tasks;
  const taskType = tasks[0][stepSource.toLowerCase()]?.type;
  const cloudwatchStep =
    tasks[0][stepSource.toLowerCase()][taskType.toLowerCase()];
  const connectorType = tasks[0]?.task_connector_sources[0]?.id;

  switch (taskType) {
    case "FILTER_LOG_EVENTS":
      modelType = "CLOUDWATCH_LOG_GROUP";
      break;
    case "METRIC_EXECUTION":
      modelType = "CLOUDWATCH_METRIC";
  }

  const stepData = {
    source: stepSource,
    connector_type: stepSource,
    taskType,
    modelType,
    connectorType,
    namespaceName: cloudwatchStep?.namespace,
    region: cloudwatchStep?.region,
    dimensionName: cloudwatchStep?.dimensions[0].name,
    dimensionValue: cloudwatchStep?.dimensions[0].value,
    metric: tasks.map((task) => {
      const cloudwatchTaskInStep =
        task[stepSource.toLowerCase()][taskType.toLowerCase()];
      return {
        id: cloudwatchTaskInStep?.metric_name,
        label: cloudwatchTaskInStep?.metric_name,
      };
    }),
    logGroup: cloudwatchStep?.log_group_name,
    cw_log_query: cloudwatchStep?.filter_query,
  };

  return stepData;
};
