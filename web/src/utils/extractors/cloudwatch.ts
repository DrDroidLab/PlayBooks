export const extractCloudwatchTasks = (step: any) => {
  let stepSource = "CLOUDWATCH";
  let modelType = "";
  const tasks = step.tasks;
  const taskType = tasks[0][stepSource.toLowerCase()]?.type;
  const cloudwatchStep =
    tasks[0][stepSource.toLowerCase()][taskType.toLowerCase()];

  switch (cloudwatchStep.type) {
    case "FILTER_LOG_EVENTS":
      modelType = "CLOUDWATCH_LOG_GROUP";
      break;
    case "METRIC_EXECUTION":
      modelType = "CLOUDWATCH_METRIC";
  }

  const stepData = {
    modelType,
    source: stepSource,
    connector_type: stepSource,
    taskType,
    model_type: modelType,
    namespaceName: cloudwatchStep?.namespace,
    region:
      cloudwatchStep?.region ?? cloudwatchStep?.filter_log_events_task?.region,
    dimensionName: cloudwatchStep?.dimensions[0].name,
    dimensionValue: cloudwatchStep?.dimensions[0].value,
    metric: tasks.map((task) => {
      const cloudwatchTaskInStep = task?.metric_task?.cloudwatch_task;
      return {
        id: cloudwatchTaskInStep?.metric_name,
        label: cloudwatchTaskInStep?.metric_name,
      };
    }),
    logGroup: cloudwatchStep?.filter_log_events_task?.log_group_name,
    cw_log_query: cloudwatchStep?.filter_log_events_task?.filter_query,
  };

  return stepData;
};
