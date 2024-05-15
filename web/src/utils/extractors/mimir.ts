export const extractMimirTasks = (step: any) => {
    let stepSource = "GRAFANA_MIMIR";
    let modelType = "GRAFANA_MIMIR_PROMQL";
    let selected = "GRAFANA_MIMIR PromQL";
    const tasks = step.tasks;
    const mimirTask = tasks[0].metric_task?.mimir_task;
  
    const stepData = {
      source: stepSource,
      selectedSource: selected,
      connector_type: stepSource,
      model_type: modelType,
      modelType,
      promql_expression: mimirTask.promql_metric_execution_task.promql_expression,
    };
  
    return stepData;
  };
  