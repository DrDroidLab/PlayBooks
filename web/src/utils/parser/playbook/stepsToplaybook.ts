import {
  Playbook,
  PlaybookContract,
  PlaybookContractStep,
  Step,
} from "../../../types.ts";
import stepToTasks from "./stepToTasks.ts";

export const stepsToPlaybook = (playbookVal: Playbook, steps: Step[]) => {
  const playbookContractSteps: PlaybookContractStep[] = steps.map((step, i) => {
    return {
      name: step.name!,
      description: step.description || `Step - ${(i ?? 0) + 1}`,
      external_links: step.externalLinks ?? [],
      tasks: stepToTasks(step),
      notes: step.notes ?? "",
    };
  });
  let playbook: PlaybookContract = {
    name: playbookVal.name,
    description: playbookVal.description,
    global_variable_set: playbookVal.globalVariables?.reduce((acc, curr) => {
      acc[curr.name] = curr.value;
      return acc;
    }, {}),
    steps: playbookContractSteps,
  };

  return playbook;
};
