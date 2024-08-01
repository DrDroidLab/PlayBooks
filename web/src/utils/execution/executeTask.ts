import { store } from "../../store/index.ts";
import { updateCardById } from "./updateCardById.ts";
import {
  currentPlaybookSelector,
  popFromExecutionStack,
} from "../../store/features/playbook/playbookSlice.ts";
import getCurrentTask from "../playbook/task/getCurrentTask.ts";
import { executionTaskExecute } from "../../store/features/playbook/api/executions/executionTaskExecuteApi.ts";
import checkId from "../common/checkId.ts";
import updateStepById from "../playbook/step/updateStepById.ts";
import { executionBulkTaskExecute } from "../../store/features/playbook/api/executions/executionBulkTaskExecuteApi.ts";
import { extractTimeFromHours } from "../../components/Playbooks/task/taskConfiguration/comparison/utils/extractTimeFromHours.ts";

export async function executeTask(id?: string) {
  const [task] = getCurrentTask(id);
  const currentPlaybook = currentPlaybookSelector(store.getState());
  if (!task) return;
  const dispatch = store.dispatch;
  if (Object.keys(task?.ui_requirement.errors ?? {}).length > 0) {
    updateCardById("ui_requirement.showError", true, id);
    return;
  }
  const isBulk = task.execution_configuration.is_bulk_execution;

  const stepId = task.ui_requirement.stepId;
  updateStepById("ui_requirement.outputLoading", true, stepId);
  updateStepById("ui_requirement.showOutput", false, stepId);
  updateStepById("ui_requirement.outputError", undefined, stepId);

  updateCardById("ui_requirement.outputLoading", true, id);
  updateCardById("ui_requirement.showOutput", false, id);
  updateCardById("ui_requirement.outputError", undefined, id);

  dispatch(popFromExecutionStack());

  try {
    const res = await store
      .dispatch(
        isBulk
          ? executionBulkTaskExecute.initiate({
              ...task,
              id: checkId(task.id!),
              ui_requirement: undefined,
              global_variable_set: currentPlaybook?.global_variable_set,
              execution_configuration: task.execution_configuration
                ? {
                    ...task.execution_configuration,
                    timeseries_offsets: task?.execution_configuration
                      ?.timeseries_offsets?.[0]
                      ? [
                          extractTimeFromHours(
                            task?.execution_configuration
                              ?.timeseries_offsets?.[0],
                          ),
                        ]
                      : undefined,
                  }
                : {},
            })
          : executionTaskExecute.initiate({
              ...task,
              id: checkId(task.id!),
              ui_requirement: undefined,
              global_variable_set: currentPlaybook?.global_variable_set,
              execution_configuration: task.execution_configuration
                ? {
                    ...task.execution_configuration,
                    timeseries_offsets: task?.execution_configuration
                      ?.timeseries_offsets?.[0]
                      ? [
                          extractTimeFromHours(
                            task?.execution_configuration
                              ?.timeseries_offsets?.[0],
                          ),
                        ]
                      : undefined,
                  }
                : {},
            }),
      )
      .unwrap();

    const outputs = isBulk
      ? res?.playbook_task_execution_logs
      : [res?.playbook_task_execution_log];

    const list: any = [];

    outputs.forEach((output) => {
      const outputError = output?.result?.error;

      updateCardById("ui_requirement.showOutput", true, id);
      list.push({
        data: { ...output?.result, timestamp: output?.timestamp },
        error: outputError ? outputError : undefined,
        interpretation: output?.interpretation,
        execution_global_variable_set: output?.execution_global_variable_set,
      });
      if (outputError) {
        updateCardById("ui_requirement.showError", true, id);
      }
    });
    updateCardById("ui_requirement.outputs", list, id);
  } catch (e: any) {
    updateCardById("ui_requirement.showError", true, id);
    updateCardById("ui_requirement.outputError", e.message, id);
    console.error(e);
  } finally {
    updateCardById("ui_requirement.showOutput", true, id);
    updateCardById("ui_requirement.outputLoading", false, id);

    updateStepById("ui_requirement.showOutput", true, stepId);
    updateStepById("ui_requirement.outputLoading", false, stepId);
  }
}
