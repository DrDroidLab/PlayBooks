import { store } from "../../../store/index.ts";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { Step } from "../../../types/index.ts";

function getCurrentStep(id?: string): [Step | undefined, string | undefined] {
  const { currentPlaybook, currentVisibleStep } = playbookSelector(
    store.getState(),
  );
  const currentId = id ?? currentVisibleStep;
  const steps = currentPlaybook?.steps ?? [];
  const step = steps.find((task) => task.id === currentId);

  return [step, currentId];
}

export default getCurrentStep;
