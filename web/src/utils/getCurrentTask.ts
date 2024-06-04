import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";
import { store } from "../store/index.ts";

function getCurrentTask(index?: number) {
  const { steps, currentStepIndex } = playbookSelector(store.getState());
  const currentIndex = index ?? currentStepIndex;
  const task =
    steps.length > 0 && currentIndex !== null && currentIndex !== undefined
      ? steps[currentIndex]
      : {};

  return [task, currentIndex];
}

export default getCurrentTask;
