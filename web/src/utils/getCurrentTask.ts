import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";
import { store } from "../store/index.ts";

function getCurrentTask(index?: number) {
  const { steps, currentStepIndex } = playbookSelector(store.getState());
  const currentIndex = index ?? currentStepIndex;
  const step =
    steps.length > 0 && currentIndex !== null && currentIndex !== undefined
      ? steps[currentIndex]
      : {};
  const task = step?.tasks[0];

  return [step, currentIndex, task];
}

export default getCurrentTask;
