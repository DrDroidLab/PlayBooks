export const extractTextTasks = (step: any) => {
  let stepSource = "DOCUMENTATION";
  let modelType = "MARKDOWN";
  let selected = "DOCUMENTATION";
  const tasks = step.tasks;
  const documentationTask = tasks[0].documentation_task;

  const stepData = {
    source: stepSource,
    selectedSource: selected,
    connector_type: stepSource,
    model_type: modelType,
    modelType,
    notes: documentationTask.documentation,
  };

  return stepData;
};
