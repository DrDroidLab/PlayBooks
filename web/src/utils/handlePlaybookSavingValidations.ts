import { store } from "../store/index.ts";
import { currentPlaybookSelector } from "../store/features/playbook/playbookSlice.ts";
import { showSnackbar } from "../store/features/snackbar/snackbarSlice.ts";
import { updateCardById } from "./execution/updateCardById.ts";
import { Step, Task } from "../types/index.ts";

export default function handlePlaybookSavingValidations() {
  const currentPlaybook = currentPlaybookSelector(store.getState());
  const steps = currentPlaybook?.steps ?? [];
  const tasks = currentPlaybook?.ui_requirement.tasks ?? [];
  const dispatch = store.dispatch;
  let error = "";

  if (steps?.length === 0) {
    error = "You cannot save a playbook with no steps";
  }

  if (tasks?.length === 0) {
    error = "You cannot save a playbook with no tasks";
  }

  steps?.forEach((step: Step) => {
    step.tasks?.forEach((taskId: Task | string) => {
      let task: Task | undefined =
        typeof taskId === "string"
          ? tasks?.find((t) => t.id === taskId)
          : taskId;
      if (!task) {
        error = "Task not found in playbook";
      } else {
        if (Object.keys(task.ui_requirement?.errors ?? {}).length > 0) {
          updateCardById("showError", true, task.id);
          error = "Please fix the errors in the playbook";
        }
        const source = task?.source;
        const taskType = task?.[source.toLowerCase()]?.type;
        if (!task.source || !taskType) {
          updateCardById("showError", true, step.id);
          error = "Please select a task type for each step";
        }
      }
    });
  });

  if (error) {
    dispatch(showSnackbar(error));
  }

  return error;
}
