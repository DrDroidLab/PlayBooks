import { PayloadAction } from "@reduxjs/toolkit";
import {
  LogicalOperator,
  PlaybookUIState,
  StepRelation,
} from "../../../../../types/index.ts";

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
    id: `edge-${source}-${target}`,
    child,
    parent,
    condition: {
      logical_operator: LogicalOperator.AND_LO,
      rules: [],
    },
    ui_requirement: {},
  };

  currentPlaybook?.step_relations.push(newRelation);
};