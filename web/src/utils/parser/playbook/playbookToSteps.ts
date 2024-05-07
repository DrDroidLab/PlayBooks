import { GlobalVariable, Step } from "../../../types.ts";
import { handleStepSourceExtractor } from "./handleStepSourceExtractor.ts";

export const playbookToSteps = (playbook: any, isCopied = false): Step[] => {
  if (!(playbook.steps && playbook.steps.length > 0)) return [];
  const list: Step[] = [];
  for (let [i, step] of playbook.steps.entries()) {
    let data: any = handleStepSourceExtractor(step);

    const stepData: Step = {
      name: step?.name,
      description: step.description ?? `Step - ${i}`,
      id: step.id,
      notes: step?.notes,
      externalLinks: step.external_links,
      isPrefetched: true,
      isCopied: isCopied,
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
