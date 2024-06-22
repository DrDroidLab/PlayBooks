import {
  setSteps,
  stepsSelector,
} from "../../../store/features/playbook/playbookSlice.ts";
import { store } from "../../../store/index.ts";
import { GlobalVariable, Step } from "../../../types.ts";
import { handleStepSourceExtractor } from "./handleStepSourceExtractor.ts";

export const executionToPlaybook = (playbook_execution) => {
  // TODO: Make it better, also extract logs from here
  const playbook = playbook_execution?.playbook;
  const stepExecutionLogs: any = playbook_execution?.step_execution_logs ?? {};
  const list: Step[] = [];
  for (let [i, stepExecutionLog] of Object.entries(stepExecutionLogs)) {
    const step = structuredClone((stepExecutionLog as any).step);
    step.tasks = (stepExecutionLog as any)?.task_execution_logs?.map(
      (log) => log.task,
    );
    let data: any = handleStepSourceExtractor(step);

    const outputList: any = [];
    for (let outputData of (stepExecutionLog as any)?.task_execution_logs) {
      outputList.push(outputData);
    }
    data.showOutput = true;
    data.outputs = {
      data: outputList,
    };

    const stepData: Step = {
      name: step?.name,
      description: step.description ?? `Step - ${i}`,
      id: step.id,
      notes: step?.notes,
      externalLinks: step.external_links,
      isPrefetched: true,
      isOpen: false,
      globalVariables: Object.entries(playbook.global_variable_set ?? {}).map(
        (val): GlobalVariable => {
          return {
            name: val[0],
            value: val[1] as string,
          };
        },
      ),
      showError: false,
      isPlayground: false,
      stepType: "",
      action: "",
      ...data,
    };

    list.push(stepData);
  }

  const playbookSteps = stepsSelector(store.getState());
  const steps = playbookSteps.map((step: Step) => {
    const found = list.find(
      (stepData) => stepData.id.toString() === step.id.toString(),
    );
    if (found) {
      return found;
    } else {
      return step;
    }
  });
  store.dispatch(setSteps(steps));

  return list;
};
