import { store } from "../../store/index.ts";
import {
  executePlaybookStep,
  executionStepExecute,
} from "../../store/features/playbook/api/index.ts";
import {
  playbookSelector,
  popFromExecutionStack,
} from "../../store/features/playbook/playbookSlice.ts";
import getCurrentStep from "../playbook/step/getCurrentStep.ts";
import updateStepById from "../playbook/step/updateStepById.ts";
import checkId from "../common/checkId.ts";
import { Task } from "../../types/index.ts";
import { updateCardById } from "./updateCardById.ts";

export async function executeStep(id?: string) {
  const { executionId, currentPlaybook } = playbookSelector(store.getState());
  const tasks = currentPlaybook?.ui_requirement?.tasks ?? [];
  const dispatch = store.dispatch;
  const [step, currentStepId] = getCurrentStep(id);
  const stepTasks = step?.tasks.map((taskId: Task | string) =>
    tasks.find(
      (task) => task.id === (typeof taskId === "string" ? taskId : taskId.id),
    ),
  );

  const globalVariableSet = {};
  if (currentPlaybook?.global_variable_set) {
    for (let key in currentPlaybook?.global_variable_set) {
      globalVariableSet[key] = String(
        currentPlaybook?.global_variable_set[key],
      );
    }
  }

  if (!currentStepId) return;
  const stepData = {
    ...step,
    id: checkId(currentStepId),
    ui_requirement: undefined,
    tasks: (stepTasks ?? [])?.map((e: Task | undefined) => ({
      ...e,
      id: checkId(e?.id ?? ""),
      ui_requirement: undefined,
      global_variable_set: globalVariableSet,
    })),
  };

  // Check Task errors
  stepTasks?.forEach((task) => {
    if (Object.keys(task?.ui_requirement.errors ?? {}).length > 0) {
      updateCardById("ui_requirement.showError", true, currentStepId);
      return;
    }
  });

  // Set tasks to loading
  stepTasks?.forEach((task) => {
    updateCardById("ui_requirement.outputLoading", true, task?.id);
    updateCardById("ui_requirement.showOutput", false, task?.id);
    updateCardById("ui_requirement.outputError", undefined, task?.id);
  });

  // Set step to loading
  updateStepById("ui_requirement.outputLoading", true, currentStepId);
  updateStepById("ui_requirement.showOutput", false, currentStepId);
  updateStepById("ui_requirement.outputError", undefined, currentStepId);

  dispatch(popFromExecutionStack());

  try {
    const res = executionId
      ? await store.dispatch(executionStepExecute.initiate(stepData)).unwrap()
      : await store.dispatch(executePlaybookStep.initiate(stepData)).unwrap();
    const outputList: any = [];
    const output = res?.step_execution_log;
    for (let outputData of output?.task_execution_logs ?? []) {
      outputList.push(outputData);
    }
    const outputErrors = outputList?.filter(
      (output: any) => output?.result?.error,
    );
    const error = outputErrors.length > 0 ? outputErrors[0] : undefined;

    // Set task data (error and output)
    outputList.forEach((outputs, index: number) => {
      const list: any = [];
      const taskId: Task | string | undefined = step?.tasks[index];
      const id = typeof taskId === "string" ? taskId : taskId?.id;

      outputs.forEach((output) => {
        const outputError = output?.result?.error;
        list.push({
          data: { ...output?.result, timestamp: output?.timestamp },
          interpretation: output?.interpretation,
          execution_global_variable_set: output?.execution_global_variable_set,
          error: outputError ? outputError : undefined,
        });
        if (outputError) {
          updateCardById("ui_requirement.showError", true, id);
          updateCardById("ui_requirement.outputError", true, id);
        }
      });

      updateCardById("ui_requirement.outputs", list, id);
    });

    // Set step output
    updateStepById(
      "ui_requirement.output",
      {
        data: output?.result,
        interpretation: output?.interpretation,
      },
      currentStepId,
    );

    // Push step to execution stack
    dispatch(popFromExecutionStack());

    // Set step error
    if (error) {
      updateStepById("ui_requirement.showError", true, currentStepId);
      updateStepById(
        "ui_requirement.outputError",
        error.result?.error,
        currentStepId,
      );
    }
  } catch (e: any) {
    updateStepById("ui_requirement.showError", true, currentStepId);
    updateStepById("ui_requirement.outputError", e.message, currentStepId);
    console.error(e);
  } finally {
    updateStepById("ui_requirement.showOutput", true, currentStepId);
    updateStepById("ui_requirement.outputLoading", false, currentStepId);

    // Stop tasks loading
    stepTasks?.forEach((task) => {
      updateCardById("ui_requirement.outputLoading", false, task?.id);
      updateCardById("ui_requirement.showOutput", true, task?.id);
    });
  }
}
