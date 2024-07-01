import { updateTask } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";

export function updateCardById(key, value, id?: string) {
  const currentTaskId = store.getState().playbook.currentVisibleTask;
  const taskId = id ? id : currentTaskId;
  store.dispatch(
    updateTask({
      id: taskId,
      key,
      value,
    }),
  );
}
