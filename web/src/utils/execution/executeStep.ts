import { store } from "../../store/index.ts";
import { executePlaybookStep } from "../../store/features/playbook/api/index.ts";
import { Step } from "../../types.ts";
import { stateToStep } from "../parser/playbook/stateToStep.ts";
import { updateCardByIndex } from "./updateCardByIndex.ts";

export async function executeStep(step: Step) {
  if (Object.keys(step.errors ?? {}).length > 0) {
    updateCardByIndex("showError", true);
    return;
  }

  const stepData = stateToStep(step);
  updateCardByIndex("outputLoading", true);
  updateCardByIndex("showOutput", false);

  try {
    const res = await store
      .dispatch(executePlaybookStep.initiate(stepData))
      .unwrap();
    const outputList: any = [];
    const output = res?.step_execution_log;
    for (let outputData of output.logs) {
      outputList.push(outputData);
    }
    updateCardByIndex("showOutput", true);
    updateCardByIndex("outputs", {
      data: outputList,
      stepInterpretation: output.step_interpretation,
    });
  } catch (e) {
    updateCardByIndex("showError", true);
    updateCardByIndex("outputError", e.message);
    console.error(e);
  } finally {
    updateCardByIndex("showOutput", true);
    updateCardByIndex("outputLoading", false);
  }
}
