import { GlobalVariable, Step } from "../../../types/index.ts";
import { handleStepSourceExtractor } from "./handleStepSourceExtractor.ts";

export const executionToPlaybook = (playbook_execution) => {
  // TODO: Make it better, also extract logs from here
  const playbook = playbook_execution.playbook;
  const stepExecutionLogs = playbook_execution.step_execution_logs;
  const list: Step[] = [];
  for (let [i, stepExecutionLog] of stepExecutionLogs.entries()) {
    const step = structuredClone(stepExecutionLog.step);
    step.tasks = stepExecutionLog.logs?.map((log) => log.task);
    let data: any = handleStepSourceExtractor(step);

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

  return list;
};
