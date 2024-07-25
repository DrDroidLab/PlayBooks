import { PayloadAction } from "@reduxjs/toolkit";
import {
  LogicalOperator,
  PlaybookUIState,
  Step,
} from "../../../../../types/index.ts";
import generateUUIDWithoutHyphens from "../../../../../utils/generateUUIDWithoutHyphens.ts";
import { v4 as uuidv4 } from "uuid";

const emptyStep: Step = {
  id: "",
  tasks: [],
  ui_requirement: {
    isOpen: true,
    showError: false,
  },
};

export const addStep = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  const { parentId, id, addCondition } = payload;
  const stepId = id ?? generateUUIDWithoutHyphens();
  const newStep: Step = {
    ...emptyStep,
    id: stepId,
    reference_id: uuidv4(),
    description: `Step`,
    tasks: [],
  };
  state.currentPlaybook?.steps.push(newStep);
  const parentStep = state.currentPlaybook?.steps.find(
    (step) => step.id === parentId,
  );
  if (
    state.currentPlaybook &&
    (!state.currentPlaybook?.step_relations ||
      state.currentPlaybook?.step_relations?.length === 0)
  ) {
    state.currentPlaybook.step_relations = [];
  }
  state.currentPlaybook?.step_relations?.push({
    id: `edge-${parentId}-${stepId}`,
    parent: parentStep!,
    child: newStep,
    condition: addCondition
      ? {
          logical_operator: LogicalOperator.AND_LO,
          rules: [],
        }
      : undefined,
  });
};
