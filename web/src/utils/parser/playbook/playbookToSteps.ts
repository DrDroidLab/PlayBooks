import { Step } from "../../../types.ts";
import { unsupportedInterpreterTypes } from "../../unsupportedInterpreterTypes.ts";
import globalVariableToState from "./globalVariableToState.ts";
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
      globalVariables: globalVariableToState(playbook.global_variable_set),
      interpreter: {
        type: !unsupportedInterpreterTypes.includes(step?.interpreter_type)
          ? step?.interpreter_type
          : undefined,
      },
      showError: false,
      isPlayground: false,
      action: "",
      stepIndex: i,
      children: step.children,
      isEditing: false,
      ...data,
    };

    list.push(stepData);
  }
  return list;
};
