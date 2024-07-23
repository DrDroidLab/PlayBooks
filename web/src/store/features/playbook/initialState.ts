import { PlaybookUIState, Step } from "../../../types/index.ts";
import generateUUIDWithoutHyphens from "../../../utils/generateUUIDWithoutHyphens.ts";
import { v4 as uuidv4 } from "uuid";

const firstStepId = generateUUIDWithoutHyphens();
const firstStep: Step = {
  id: firstStepId,
  description: `Step`,
  reference_id: uuidv4(),
  tasks: [],
  ui_requirement: {
    isOpen: true,
    showError: false,
    stepIndex: 0,
  },
};

export const initialState: PlaybookUIState = {
  playbooks: [],
  currentPlaybook: {
    id: undefined,
    global_variable_set: {},
    steps: [firstStep],
    step_relations: [],
    ui_requirement: {
      tasks: [],
      isExisting: false,
    },
  },
  meta: {
    page: {
      limit: 10,
      offset: 0,
    },
  },
  shouldScroll: undefined,
  permanentView: undefined,
  currentVisibleStepOnTimeline: undefined,
  executionId: undefined,
  isOnPlaybookPage: false,
  executionStack: [],
  zoomLevel: 0.75,
  connectorOptions: [],
};
