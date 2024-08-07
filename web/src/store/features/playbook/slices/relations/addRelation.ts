import { PayloadAction } from "@reduxjs/toolkit";
import {
  LogicalOperator,
  PlaybookUIState,
  StepRelation,
} from "../../../../../types/index.ts";
import { playbookSlice } from "../../playbookSlice.ts";

type AddRelationArgType = {
  source: string;
  target: string;
};

export const addRelation = (
  state: PlaybookUIState,
  { payload }: PayloadAction<AddRelationArgType>,
) => {
  const { source, target } = payload;
  const { currentPlaybook } = state;
  const parent = currentPlaybook?.steps.find((step) => step.id === source);
  const child = currentPlaybook?.steps.find((step) => step.id === target);
  const id = `edge-${source}-${target}`;
  const existingEdge = currentPlaybook?.step_relations.find(
    (relation) => relation.id === id,
  );

  if (!parent || !child || existingEdge) return;

  const newRelation: StepRelation = {
    id,
    child,
    parent,
    condition: {
      logical_operator: LogicalOperator.AND_LO,
      rule_sets: [],
    },
    ui_requirement: {},
  };

  playbookSlice.caseReducers.addStepRuleSet(state, {
    payload: { id },
    type: "",
  });

  currentPlaybook?.step_relations.push(newRelation);
};
