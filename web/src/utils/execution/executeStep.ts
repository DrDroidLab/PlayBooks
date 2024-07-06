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
import checkId from "../checkId.ts";

export async function executeStep(id?: string) {
  const { executionId } = playbookSelector(store.getState());
  const dispatch = store.dispatch;
  const [step, currentStepId] = getCurrentStep(id);

  if (!currentStepId) return;
  const stepData = {
    ...step,
    id: checkId(currentStepId),
    ui_requirement: undefined,
  };

  if (Object.keys(step?.ui_requirement.errors ?? {}).length > 0) {
    updateStepById("showError", true, currentStepId);
    return;
  }

  updateStepById("outputLoading", true, currentStepId);
  updateStepById("showOutput", false, currentStepId);
  updateStepById("outputError", undefined, currentStepId);

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

    updateStepById("showOutput", true, currentStepId);
    updateStepById(
      "outputs",
      {
        data: outputList,
        stepInterpretation: output.step_interpretation,
      },
      currentStepId,
    );
    if (error) {
      updateStepById("showError", true, currentStepId);
      updateStepById("outputError", error.result?.error, currentStepId);
    }
  } catch (e) {
    updateStepById("showError", true, currentStepId);
    updateStepById("outputError", e.message, currentStepId);
    console.error(e);
  } finally {
    updateStepById("showOutput", true, currentStepId);
    updateStepById("outputLoading", false, currentStepId);
  }
}
