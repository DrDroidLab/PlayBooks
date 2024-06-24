import { store } from "../../store/index.ts";
import { updateStep } from "../../store/features/playbook/playbookSlice.ts";

export function updateCardById(key, value, id?: string) {
  const currentStepId = store.getState().playbook.currentStepId;
  const stepId = id ? id : currentStepId;
  store.dispatch(
    updateStep({
      id: stepId,
      key,
      value,
    }),
  );
}
