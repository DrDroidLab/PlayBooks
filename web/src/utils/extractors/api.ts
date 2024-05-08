export const extractApiTasks = (step: any) => {
  let stepSource = "API";
  let modelType = "API";
  let selected = "API";
  const tasks = step.tasks;
  const apiTask = tasks[0].action_task?.api_call_task;

  const stepData = {
    source: stepSource,
    selectedSource: selected,
    connector_type: stepSource,
    model_type: modelType,
    modelType,
    action: {
      method: apiTask.method,
      url: apiTask.url,
      headers: JSON.stringify(apiTask.headers ?? {}),
      timeout: apiTask.timeout,
      payload: JSON.stringify(apiTask.payload ?? {}),
    },
  };

  return stepData;
};
