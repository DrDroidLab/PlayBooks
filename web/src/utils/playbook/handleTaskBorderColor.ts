import getCurrentTask from "../getCurrentTask.ts";

function handleTaskBorderColor(taskId: string) {
  const [task] = getCurrentTask(taskId);

  if (task?.ui_requirement?.outputError) {
    return "red";
  }

  if (task?.ui_requirement?.output?.data) {
    return "green";
  }
}

export default handleTaskBorderColor;
