import {
  Playbook,
  PlaybookContract,
  PlaybookContractStep,
  Step,
} from "../../../types.ts";
import { stateToStep } from "./stateToStep.ts";

export const stepsToPlaybook = (playbookVal: Playbook, steps: Step[]) => {
  const playbookContractSteps: PlaybookContractStep[] = steps.map((step, i) => {
    return stateToStep(step, i);
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
