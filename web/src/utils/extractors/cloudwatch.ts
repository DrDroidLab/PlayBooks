export const extractCloudwatchTasks = (step: any) => {
  let stepSource = "CLOUDWATCH";
  let selected = "";
  let modelType = "";
  const tasks = step.tasks;
  const cloudwatchStep = tasks[0]?.metric_task?.cloudwatch_task;

  switch (cloudwatchStep.type) {
    case "FILTER_LOG_EVENTS":
      selected = "CLOUDWATCH Log Group";
      modelType = "CLOUDWATCH_LOG_GROUP";
      break;
    case "METRIC_EXECUTION":
      selected = "CLOUDWATCH Metric";
      modelType = "CLOUDWATCH_METRIC";
  }

  const stepData = {
    modelType,
    source: stepSource,
    selectedSource: selected,
    connector_type: stepSource,
    model_type: modelType,
    namespaceName: cloudwatchStep?.metric_execution_task?.namespace,
    region:
      cloudwatchStep?.metric_execution_task?.region ??
      cloudwatchStep?.filter_log_events_task?.region,
    dimensionName: cloudwatchStep?.metric_execution_task?.dimensions[0].name,
    dimensionValue: cloudwatchStep?.metric_execution_task?.dimensions[0].value,
    metric: tasks.map((task) => {
      const cloudwatchTaskInStep = task?.metric_task?.cloudwatch_task;
      return {
        id: cloudwatchTaskInStep?.metric_execution_task?.metric_name,
        label: cloudwatchTaskInStep?.metric_execution_task?.metric_name,
      };
    }),
    logGroup: cloudwatchStep?.filter_log_events_task?.log_group_name,
    cw_log_query: cloudwatchStep?.filter_log_events_task?.filter_query,
  };

  return stepData;
};
