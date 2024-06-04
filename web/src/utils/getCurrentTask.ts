import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";
import { store } from "../store/index.ts";

function getCurrentTask() {
  const { stepsWithTasks: steps, currentStepIndex } = playbookSelector(
    store.getState(),
  );
  const step = steps ? steps[currentStepIndex] : {};
  const task = step?.tasks[0];

  return [step, currentStepIndex, task];
}

export default getCurrentTask;
