import { GlobalVariableSet } from "./globalVariableSet.ts";
import { Step } from "./step.ts";
import { StepRelation, StepRelationContract } from "./stepRelations.ts";
import { Task } from "./task.ts";

type PlaybookUIRequirement = {
  tasks: Task[];
  isExisting: boolean;
  isCopied: boolean;
};

export type Playbook = {
  id?: string;
  global_variable_set: GlobalVariableSet;
  name?: string;
  description?: string;
  steps: Step[];
  step_relations: (StepRelation | StepRelationContract)[];
  ui_requirement: PlaybookUIRequirement;
};

export type PlaybookUIState = {
  currentPlaybook?: Playbook;
  playbooks: Playbook[];
  meta: any;
  isOnPlaybookPage: boolean;
  currentVisibleTask?: string;
  currentVisibleStep?: string;
  currentVisibleStepOnTimeline?: string;
  permanentView?: string;
  shouldScroll?: boolean;
  executionId?: string;
  executionStack?: any;
  zoomLevel?: any;
  connectorOptions?: any;
  supportedTaskTypes?: any;
};
