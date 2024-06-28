import { GlobalVariableSet } from "./globalVariableSet.ts";
import { Step } from "./step.ts";
import { StepRelation } from "./stepRelations.ts";

export type Playbook = {
  id: string;
  global_variable_set: GlobalVariableSet[];
  name?: string;
  description?: string;
  steps: Step[];
  step_relations: StepRelation[];
};

export type PlaybookUIState = {
  currentPlaybook: Playbook;
  playbooks: Playbook[];
  meta: any;
  isOnPlaybookPage: boolean;
  currentVisibleTask?: string;
  permanentView?: string;
  shouldScroll?: boolean;
  executionId?: string;
};
