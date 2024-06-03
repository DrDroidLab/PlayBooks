export const extractAzureTasks = (step: any) => {
    let stepSource = "AZURE";
    let selected = "";
    let modelType = "AZURE_WORKSPACE";
    const tasks = step.tasks;
    const azureStep = tasks[0]?.metric_task?.azure_task;
  
    switch (azureStep.type) {
      case "FILTER_LOG_EVENTS":
        selected = "AZURE Log Analytics";
        modelType = "AZURE_WORKSPACE";
    }
  
    const stepData = {
      modelType,
      source: stepSource,
      selectedSource: selected,
      connector_type: stepSource,
      model_type: modelType,
      workspaceId: azureStep?.filter_log_events_task?.workspace_id,
      filter_query: azureStep?.filter_log_events_task?.filter_query,
      timespan: azureStep?.filter_log_events_task?.timespan,
    };
  
    return stepData;
  };
  