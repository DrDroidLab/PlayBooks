import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";
import { store } from "../store/index.ts";

function getCurrentTask() {
  const { steps, currentStepIndex } = playbookSelector(store.getState());
  const task = steps ? steps[currentStepIndex] : {};

  return [task, currentStepIndex];
}

export default getCurrentTask;
