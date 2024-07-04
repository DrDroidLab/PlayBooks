import { GlobalVariableSet } from "./globalVariableSet.ts";
import { TaskConnectorSource } from "./taskConnectorSources.ts";
import { TaskDetails } from "./taskDetails.ts";

type TaskUIRequirement = {
  isOpen: boolean;
  stepId: string;
  position: {
    x: number;
    y: number;
  };
  assets?: any;
  nrqlData?: any;
  taskType?: string;
  outputLoading?: boolean;
  outputError?: boolean;
  errors?: any;
  showOutput?: boolean;
  output?: any;
  userEnteredDescription?: boolean;
  assetsLoading?: boolean;
  model_type?: string;
  modelOptions?: any;
  showError?: boolean;
  showNotes?: boolean;
  showExternalLinks?: boolean;
};

export type Task = {
  id?: string;
  source: string;
  reference_id?: string;
  name?: string;
  description?: string;
  notes?: string;
  created_by?: string;
  global_variable_set?: GlobalVariableSet;
  interpreter_type: string;
  task_connector_sources: TaskConnectorSource[];
  ui_requirement: TaskUIRequirement;
} & Partial<TaskDetails>;
