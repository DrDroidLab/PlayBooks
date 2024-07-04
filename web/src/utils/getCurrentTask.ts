import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";
import { store } from "../store/index.ts";

function getCurrentTask(id?: string) {
  const { steps, currentStepId } = playbookSelector(store.getState());
  const currentId = id ?? currentStepId;
  const task =
    steps.length > 0 && currentId
      ? steps.find((step) => step.id === currentId)
      : {};

  return [task, currentId];
}

export default getCurrentTask;
