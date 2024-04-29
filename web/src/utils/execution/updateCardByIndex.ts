import { store } from "../../store/index.ts";
import { updateStep } from "../../store/features/playbook/playbookSlice.ts";

export function updateCardByIndex(key, value) {
  store.dispatch(
    updateStep({
      index: store.getState().playbook.currentStepIndex,
      key,
      value,
    }),
  );
}
