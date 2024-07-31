import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { store } from "../../../store";
import { Task } from "../../../types";

function getCurrentTask(id?: string): [Task | undefined, string | undefined] {
  const { currentPlaybook, currentVisibleTask } = playbookSelector(
    store.getState(),
  );
  const currentId = id ?? currentVisibleTask;
  const tasks = currentPlaybook?.ui_requirement.tasks ?? [];
  const task = tasks.find((task) => task.id === currentId);

  return [task, currentId];
}

export default getCurrentTask;
