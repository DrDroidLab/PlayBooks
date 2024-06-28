import { updateTask } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";

export function updateCardById(key, value, id?: string) {
  const currentStepId = store.getState().playbook.currentVisibleTask;
  const stepId = id ? id : currentStepId;
  store.dispatch(
    updateTask({
      id: stepId,
      key,
      value,
    }),
  );
}
