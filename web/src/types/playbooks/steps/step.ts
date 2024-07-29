import { Task } from "../tasks/task.ts";
import { ExternalLink } from "./externalLink.ts";

type StepUIRequirements = {
  isOpen: boolean;
  showError: boolean;
  stepIndex?: number;
  isPrefetched?: boolean;
  assets?: any;
  outputLoading?: boolean;
  showOutput?: boolean;
  outputError?: string;
  errors?: any;
  resultType?: string;
  showExternalLinks?: boolean;
  showNotes?: boolean;
  width?: number;
  height?: number;
};

export interface Step {
  id: string;
  reference_id?: string;
  name?: string;
  description?: string;
  notes?: string;
  external_links?: ExternalLink[];
  interpreter_type?: string;
  tasks: (Task | string)[];
  children?: [];
  ui_requirement: StepUIRequirements;
}
