import { GlobalVariable, Step } from "./index.ts";

export type Playbook = {
  id?: string | null;
  name?: string;
  description?: string;
  currentPlaybook?: any;
  currentStepIndex?: string | null;
  steps: Step[];
  playbooks: any;
  meta: any;
  globalVariables: GlobalVariable[] | null;
  isEditing?: boolean;
  lastUpdatedAt?: Date | null;
  view: string;
  interpreterTypes: any[];
};
