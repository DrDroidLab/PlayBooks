import getCurrentTask from "./task/getCurrentTask.ts";

function handleTaskBorderColor(taskId: string) {
  const [task] = getCurrentTask(taskId);

  if (task?.ui_requirement?.showError) {
    return "red";
  }

  if (
    task?.ui_requirement?.outputs?.length > 0 &&
    (task?.ui_requirement?.outputs as any[])?.every((e) => {
      return e.error !== undefined;
    })
  ) {
    return "green";
  }
}

export default handleTaskBorderColor;
