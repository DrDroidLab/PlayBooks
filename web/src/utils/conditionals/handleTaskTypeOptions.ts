import { currentPlaybookSelector } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";
import { Step, Task } from "../../types/index.ts";

function handleTaskTypeOptions(step: Step | undefined) {
  const currentPlaybook = currentPlaybookSelector(store.getState());
  const tasks = currentPlaybook?.ui_requirement.tasks ?? [];
  const stepTasks = step?.tasks
    .map((task: Task | string) => {
      const taskData = tasks.find(
        (e) => e.id === (typeof task === "string" ? task : task.id),
      );
      if (Object.keys(taskData?.ui_requirement.errors).length === 0) {
        return undefined;
      }
      return taskData;
    })
    .filter((task) => task);
  return stepTasks ?? [];
}

export default handleTaskTypeOptions;
