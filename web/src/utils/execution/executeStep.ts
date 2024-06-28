import { store } from "../../store/index.ts";
import {
  executePlaybookStep,
  executionStepExecute,
} from "../../store/features/playbook/api/index.ts";
import { Step } from "../../types.ts";
import { stateToStep } from "../parser/playbook/stateToStep.ts";
import { updateCardById } from "./updateCardById.ts";
import {
  playbookSelector,
  popFromExecutionStack,
} from "../../store/features/playbook/playbookSlice.ts";

export async function executeStep(step: Step, id?: string) {
  const { executionId } = playbookSelector(store.getState());
  const dispatch = store.dispatch;
  if (Object.keys(step.errors ?? {}).length > 0) {
    updateCardById("showError", true, id);
    return;
  }

  const stepData = stateToStep(step);
  updateCardById("outputLoading", true, id);
  updateCardById("showOutput", false, id);

  dispatch(popFromExecutionStack());

  try {
    const res =
      executionId && !step.isEditing
        ? await store.dispatch(executionStepExecute.initiate(stepData)).unwrap()
        : await store.dispatch(executePlaybookStep.initiate(stepData)).unwrap();
    const outputList: any = [];
    const output = res?.step_execution_log;
    for (let outputData of output?.task_execution_logs ?? []) {
      outputList.push(outputData);
    }
    updateCardById("showOutput", true, id);
    updateCardById(
      "outputs",
      {
        data: outputList,
        stepInterpretation: output.step_interpretation,
      },
      id,
    );
  } catch (e) {
    updateCardById("showError", true, id);
    updateCardById("outputError", e.message, id);
    console.error(e);
  } finally {
    updateCardById("showOutput", true, id);
    updateCardById("outputLoading", false, id);
  }
}
