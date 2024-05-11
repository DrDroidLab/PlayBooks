export const extractBashTasks = (step: any) => {
  let stepSource = "BASH";
  let modelType = "BASH";
  let selected = "BASH";
  const tasks = step.tasks;
  const bashTask = tasks[0].action_task?.bash_command_task;

  const stepData = {
    source: stepSource,
    selectedSource: selected,
    connector_type: stepSource,
    model_type: modelType,
    modelType,
    command: bashTask.command,
    remote_server: bashTask.remote_server,
  };

  return stepData;
};
