import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";
import { store } from "../store/index.ts";

function getCurrentTask(id?: string) {
  const { currentPlaybook, currentVisibleTask } = playbookSelector(
    store.getState(),
  );
  const currentId = id ?? currentVisibleTask;
  const tasks = currentPlaybook?.ui_requirement.tasks ?? [];
  const task = tasks.find((task) => task.id === currentId);

  return [task, currentId];
}

export default getCurrentTask;
