import {
  LogicalOperator,
  PlaybookUIState,
  Step,
  StepRelationContract,
} from "../../../../../types";
import generateUUIDWithoutHyphens from "../../../../../utils/common/generateUUIDWithoutHyphens";
import { v4 as uuidv4 } from "uuid";

const emptyStep: Step = {
  id: "",
  tasks: [],
  ui_requirement: {
    isOpen: true,
    showError: false,
  },
};

export const createPlaybookForDynamicAlert = (state: PlaybookUIState) => {
  const stepId = generateUUIDWithoutHyphens();
  const notificationStepId = generateUUIDWithoutHyphens();
  const stepRefId = uuidv4();
  const notificationStepRefId = uuidv4();

  const relation: StepRelationContract = {
    id: "",
    child: {
      reference_id: notificationStepRefId,
    },
    parent: {
      reference_id: stepRefId,
    },
    condition: {
      logical_operator: LogicalOperator.AND_LO,
      rules: [],
      step_rules: [],
    },
  };

  state.currentPlaybook = {
    global_variable_set: {},
    step_relations: [relation],
    steps: [
      { ...emptyStep, id: stepId },
      { ...emptyStep, id: notificationStepId },
    ],
    ui_requirement: {
      isExisting: false,
      tasks: [],
    },
  };
};
