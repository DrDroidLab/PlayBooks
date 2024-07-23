import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState, StepRelation } from "../../../../../types/index.ts";

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

  if (!parent || !child) return;

  const newRelation: StepRelation = {
    id: `edge-${source}-${target}`,
    child,
    parent,
    condition: undefined,
    ui_requirement: undefined,
  };

  currentPlaybook?.step_relations.push(newRelation);
};
