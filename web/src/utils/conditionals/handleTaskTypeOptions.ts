import { currentPlaybookSelector } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";
import { Step, Task } from "../../types/index.ts";

function handleTaskTypeOptions(step: Step | undefined) {
  const currentPlaybook = currentPlaybookSelector(store.getState());
  const tasks = currentPlaybook?.ui_requirement.tasks ?? [];
  const stepTasks = step?.tasks.map((task: Task | string) =>
    tasks.find((e) => e.id === (typeof task === "string" ? task : task.id)),
  );
  return stepTasks ?? [];
}

export default handleTaskTypeOptions;
