import { store } from "../store/index.ts";
import { stepsSelector } from "../store/features/playbook/playbookSlice.ts";
import { showSnackbar } from "../store/features/snackbar/snackbarSlice.ts";
import { updateCardById } from "./execution/updateCardById.ts";

export default function handlePlaybookSavingValidations() {
  const steps = stepsSelector(store.getState());
  const dispatch = store.dispatch;
  let error = "";

  if (steps?.length === 0) {
    error = "You cannot save a playbook with no steps";
  }

  steps?.forEach((step) => {
    if (Object.keys(step.errors ?? {}).length > 0) {
      updateCardById("showError", true, step.id);
      error = "Please fix the errors in the playbook";
    }
    if (!step.taskType) {
      updateCardById("showError", true, step.id);
      error = "Please select a task type for each step";
    }
  });

  if (error) {
    dispatch(showSnackbar(error));
  }

  return error;
}
