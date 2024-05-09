import { store } from "../../store/index.ts";
import { updateStep } from "../../store/features/playbook/playbookSlice.ts";

export function updateCardByIndex(key, value, index?: number) {
  const stepIndex =
    index != null ? index : store.getState().playbook.currentStepIndex;
  store.dispatch(
    updateStep({
      index: stepIndex,
      key,
      value,
    }),
  );
}
