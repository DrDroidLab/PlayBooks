import {
  Playbook,
  PlaybookContract,
  PlaybookContractStep,
  Step,
} from "../../../types/index.ts";
import stateToGlobalVariable from "./stateToGlobalVariable.ts";
import { stateToStep } from "./stateToStep.ts";

export const stepsToPlaybook = (playbookVal: Playbook, steps: Step[]) => {
  const playbookContractSteps: PlaybookContractStep[] = steps.map((step, i) => {
    return stateToStep(step, i);
  });
  let playbook: PlaybookContract = {
    id: playbookVal.id,
    name: playbookVal.name,
    description: playbookVal.description,
    global_variable_set: stateToGlobalVariable(playbookVal.globalVariables),
    steps: playbookContractSteps,
  };

  return playbook;
};
