import {
  LogicalOperator,
  PlaybookUIState,
  Step,
  StepRelationContract,
  Task,
  TaskType,
} from "../../../../../types";
import generateUUIDWithoutHyphens from "../../../../../utils/common/generateUUIDWithoutHyphens";
import { v4 as uuidv4 } from "uuid";
import { playbookSlice } from "../../playbookSlice";

const emptyTask: Task = {
  execution_configuration: {},
  interpreter_type: "BASIC_I",
  task_connector_sources: [],
  source: "",
  ui_requirement: {
    isOpen: false,
    stepId: "",
  },
};

const notificationTask: Task = {
  execution_configuration: {},
  interpreter_type: "BASIC_I",
  task_connector_sources: [],
  source: "",
  slack: {
    type: TaskType.Slack,
    send_message: {
      text: "",
      channel: "",
    },
  },
  ui_requirement: {
    isOpen: false,
    stepId: "",
  },
};

const emptyStep: Step = {
  id: "",
  tasks: [],
  ui_requirement: {
    isOpen: false,
    showError: false,
  },
};

export const createPlaybookForDynamicAlert = (state: PlaybookUIState) => {
  const stepId = generateUUIDWithoutHyphens();
  const taskId = generateUUIDWithoutHyphens();
  const notificationTaskId = generateUUIDWithoutHyphens();
  const notificationStepId = generateUUIDWithoutHyphens();
  const stepRefId = uuidv4();
  const notificationStepRefId = uuidv4();
  const relationId = `edge-${stepRefId}-${notificationStepId}`;

  const relation: StepRelationContract = {
    id: relationId,
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
      { ...emptyStep, id: stepId, tasks: [taskId] },
      { ...emptyStep, id: notificationStepId, tasks: [notificationTask] },
    ],
    ui_requirement: {
      isExisting: false,
      tasks: [
        { ...emptyTask, id: taskId },
        { ...notificationTask, id: notificationTaskId },
      ],
    },
  };

  playbookSlice.caseReducers.addRule(state, {
    payload: { id: relationId },
    type: "",
  });
  playbookSlice.caseReducers.addStepRule(state, {
    payload: { id: relationId },
    type: "",
  });
};
