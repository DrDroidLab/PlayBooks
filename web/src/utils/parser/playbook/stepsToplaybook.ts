import {
  Playbook,
  PlaybookContract,
  PlaybookContractStep,
  Step,
} from "../../../types.ts";
import stateToGlobalVariable from "./stateToGlobalVariable.ts";
import { stateToStep } from "./stateToStep.ts";
import { stateToStepRelation } from "./stateToStepRelation.ts";

export const stepsToPlaybook = (playbookVal: Playbook, steps: Step[]) => {
  const playbookContractSteps: PlaybookContractStep[] = steps.map((step, i) => {
    return stateToStep(step, i);
  });
  const stepRelations = stateToStepRelation(playbookContractSteps);
  let playbook: PlaybookContract = {
    id: playbookVal.id,
    name: playbookVal.name,
    description: playbookVal.description,
    global_variable_set: stateToGlobalVariable(playbookVal.globalVariables),
    steps: playbookContractSteps,
    step_relations: stepRelations,
  };

  return playbook;
};
