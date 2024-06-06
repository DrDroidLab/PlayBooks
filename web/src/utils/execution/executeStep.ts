import { store } from "../../store/index.ts";
import { executePlaybookStep } from "../../store/features/playbook/api/index.ts";
import { Step } from "../../types.ts";
import { stateToStep } from "../parser/playbook/stateToStep.ts";
import { updateCardByIndex } from "./updateCardByIndex.ts";

export async function executeStep(step: Step, index?: number) {
  if (Object.keys(step.errors ?? {}).length > 0) {
    updateCardByIndex("showError", true, index);
    return;
  }

  const stepData = stateToStep(step);
  updateCardByIndex("outputLoading", true, index);
  updateCardByIndex("showOutput", false, index);

  try {
    const res = await store
      .dispatch(executePlaybookStep.initiate(stepData))
      .unwrap();
    const outputList: any = [];
    const output = res?.step_execution_log;
    for (let outputData of output?.task_execution_logs ?? []) {
      outputList.push(outputData);
    }
    updateCardByIndex("showOutput", true, index);
    updateCardByIndex(
      "outputs",
      {
        data: outputList,
        stepInterpretation: output.step_interpretation,
      },
      index,
    );
  } catch (e) {
    updateCardByIndex("showError", true, index);
    updateCardByIndex("outputError", e.message, index);
    console.error(e);
  } finally {
    updateCardByIndex("showOutput", true, index);
    updateCardByIndex("outputLoading", false, index);
  }
}
