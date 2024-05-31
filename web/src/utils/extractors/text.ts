export const extractTextTasks = (step: any) => {
  let stepSource = "DOCUMENTATION";
  let modelType = "MARKDOWN";
  let selected = "DOCUMENTATION";
  const tasks = step.tasks;
  const documentationTask = tasks[0].documentation_task;

  if (documentationTask.type === 'IFRAME') {
    console.log('Inside', documentationTask);
    modelType = "IFRAME";
    selected = "IFRAME";
  }

  const stepData = {
    source: stepSource,
    selectedSource: selected,
    connector_type: stepSource,
    model_type: modelType,
    modelType,
    notes: documentationTask.documentation,
    iframe_url: documentationTask.iframe_url,
  };

  return stepData;
};
