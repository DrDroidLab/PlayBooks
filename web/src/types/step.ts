import { ExternalLink } from "./externalLink.ts";
import { Task } from "./task.ts";

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
};

export interface Step {
  id: string;
  reference_id?: string;
  name?: string;
  description?: string;
  notes?: string;
  external_links?: ExternalLink[];
  interpreter_type?: string;
  tasks: Task[];
  children?: [];
  uiRequirements: StepUIRequirements;
}
