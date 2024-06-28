import { GlobalVariableSet } from "./globalVariableSet.ts";
import { Step } from "./step.ts";
import { StepRelation } from "./stepRelations.ts";
import { Task } from "./task.ts";

type PlaybookUIRequirement = {
  tasks: Task[];
};

export type Playbook = {
  id: string;
  global_variable_set: GlobalVariableSet[];
  name?: string;
  description?: string;
  steps: Step[];
  step_relations: StepRelation[];
  ui_requirement: PlaybookUIRequirement;
};

export type PlaybookUIState = {
  currentPlaybook?: Playbook;
  playbooks: Playbook[];
  meta: any;
  isOnPlaybookPage: boolean;
  isCopied: boolean;
  isEditing: boolean;
  currentVisibleTask?: string;
  permanentView?: string;
  shouldScroll?: boolean;
  executionId?: string;
  executionStack?: any;
  zoomLevel?: any;
};
