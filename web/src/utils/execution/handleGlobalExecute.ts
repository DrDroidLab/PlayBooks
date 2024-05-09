import { store } from "../../store/index.ts";
import {
  playbookSelector,
  stepsSelector,
} from "../../store/features/playbook/playbookSlice.ts";
import { stepsToPlaybook } from "../parser/playbook/stepsToplaybook.ts";
import { executePlaybook } from "../../store/features/playbook/api/executePlaybookApi.ts";
import { updateCardByIndex } from "./updateCardByIndex.ts";

export default async function handleGlobalExecute() {
  const state = store.getState();
  const playbook = playbookSelector(state);
  const steps = stepsSelector(state);
  const playbookData = stepsToPlaybook(playbook, steps);
  try {
    const res = await store
      .dispatch(executePlaybook.initiate(playbookData))
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

    console.log("res: ", res);
  } catch (e) {
    console.log("Error: ", e);
  }
}
