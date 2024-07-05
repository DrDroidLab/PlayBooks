import { store } from "../../store/index.ts";
import { updateCardById } from "./updateCardById.ts";
import { popFromExecutionStack } from "../../store/features/playbook/playbookSlice.ts";
import getCurrentTask from "../getCurrentTask.ts";
import { executionTaskExecute } from "../../store/features/playbook/api/executions/executionTaskExecuteApi.ts";

export async function executeTask(id?: string) {
  const [task] = getCurrentTask(id);
  if (!task) return;
  const dispatch = store.dispatch;
  if (Object.keys(task?.ui_requirement.errors ?? {}).length > 0) {
    updateCardById("showError", true, id);
    return;
  }

  updateCardById("ui_requirement.outputLoading", true, id);
  updateCardById("ui_requirement.showOutput", false, id);
  updateCardById("ui_requirement.outputError", undefined, id);

  dispatch(popFromExecutionStack());

  try {
    const res = await store
      .dispatch(
        executionTaskExecute.initiate({ ...task, ui_requirement: undefined }),
      )
      .unwrap();
    const output = res?.playbook_task_execution_log;
    const outputError = output?.result?.error;

    updateCardById("ui_requirement.showOutput", true, id);
    updateCardById(
      "ui_requirement.output",
      {
        data: output?.result,
        interpretation: output?.interpretation,
      },
      id,
    );
    if (outputError) {
      updateCardById("ui_requirement.showError", true, id);
      updateCardById("ui_requirement.outputError", outputError, id);
    }
  } catch (e) {
    updateCardById("ui_requirement.showError", true, id);
    updateCardById("ui_requirement.outputError", e.message, id);
    console.error(e);
  } finally {
    updateCardById("ui_requirement.showOutput", true, id);
    updateCardById("ui_requirement.outputLoading", false, id);
  }
}
