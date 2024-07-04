import { store } from "../../store/index.ts";
import {
  playbookSelector,
  stepsSelector,
} from "../../store/features/playbook/playbookSlice.ts";
import { stepsToPlaybook } from "../parser/playbook/stepsToplaybook.ts";
import { executePlaybook } from "../../store/features/playbook/api/executePlaybookApi.ts";
import { updateCardById } from "./updateCardById.ts";
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
        updateCardById("outputLoading", true, step.id);
    });
    const res = await store
      .dispatch(executePlaybook.initiate(playbookData))
      .unwrap();

    const outputs = res?.playbook_execution.step_execution_logs;
    for (let stepOutput of outputs) {
      const stepFromReq = stepOutput.step;
      const logs = stepOutput.task_execution_logs;
      const interpretation = stepOutput.step_interpretation;
      const stepId = steps.find((step) => step.id === stepFromReq.id)?.id;

      for (let log of logs) {
        const error = log.result?.error;
        if (error) {
          updateCardById("outputError", error, stepId);
          break;
        }
      }

      updateCardById("outputLoading", false, stepId);
      updateCardById("showOutput", true, stepId);
      updateCardById(
        "outputs",
        {
          data: logs,
          stepInterpretation: interpretation,
        },
        stepId,
      );
    }
  } catch (e) {
    console.log("Error: ", e);
  }
}
