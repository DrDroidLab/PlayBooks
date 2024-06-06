import { store } from "../../store/index.ts";
import {
  playbookSelector,
  stepsSelector,
} from "../../store/features/playbook/playbookSlice.ts";
import { stepsToPlaybook } from "../parser/playbook/stepsToplaybook.ts";
import { executePlaybook } from "../../store/features/playbook/api/executePlaybookApi.ts";
import { updateCardByIndex } from "./updateCardByIndex.ts";
import { Step } from "../../types.ts";
import { unsupportedRunners } from "../unsupportedRunners.ts";

export default async function handleGlobalExecute() {
  const state = store.getState();
  const playbook = playbookSelector(state);
  const steps: Step[] = stepsSelector(state);
  const playbookData = stepsToPlaybook(playbook, steps);
  try {
    steps.forEach((step, i) => {
      if (!unsupportedRunners.includes(step.source))
        updateCardByIndex("outputLoading", true, i);
    });
    const res = await store
      .dispatch(executePlaybook.initiate(playbookData))
      .unwrap();

    const outputs = res?.playbook_execution.step_execution_logs;
    for (let stepOutput of outputs) {
      const stepFromReq = stepOutput.step;
      const logs = stepOutput.task_execution_logs;
      const interpretation = stepOutput.step_interpretation;
      const stepIndex = steps.findIndex((step) => step.id === stepFromReq.id);

      for (let log of logs) {
        const error = log.result?.error;
        if (error) {
          updateCardByIndex("outputError", error, stepIndex);
          break;
        }
      }

      updateCardByIndex("outputLoading", false, stepIndex);
      updateCardByIndex("showOutput", true, stepIndex);
      updateCardByIndex(
        "outputs",
        {
          data: logs,
          stepInterpretation: interpretation,
        },
        stepIndex,
      );
    }
  } catch (e) {
    console.log("Error: ", e);
  }
}
