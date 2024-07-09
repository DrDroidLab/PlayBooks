import { currentPlaybookSelector } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";
import { Step, Task } from "../../types/index.ts";

function handleTaskTypeOptions(step: Step | undefined): Task[] {
  const currentPlaybook = currentPlaybookSelector(store.getState());
  const tasks = currentPlaybook?.ui_requirement.tasks ?? [];
  const stepTasks: Task[] =
    step?.tasks
      ?.map((task: Task | string) => {
        const taskData: Task | undefined = tasks.find(
          (e) => e.id === (typeof task === "string" ? task : task.id),
        );
        if (Object.keys(taskData?.ui_requirement.errors).length > 0) {
          return undefined;
        }
        return taskData;
      })
      ?.filter((task: Task | undefined) => task !== undefined) ?? [];
  return stepTasks ?? [];
}

export default handleTaskTypeOptions;
