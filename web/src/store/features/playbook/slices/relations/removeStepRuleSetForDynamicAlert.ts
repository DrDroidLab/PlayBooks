import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState, Step } from "../../../../../types";

export const removeStepRuleSetForDynamicAlert = (
  state: PlaybookUIState,
  { payload }: PayloadAction<string>,
) => {
  const relation = state.currentPlaybook?.step_relations.findIndex(
    (e) => e.id === payload,
  );
  if (!relation) return;
  const child: Step | undefined = state.currentPlaybook?.step_relations[
    relation
  ].child as Step;
  const childStep = state.currentPlaybook?.steps.findIndex(
    (e) => e.id === child?.id,
  );
  state.currentPlaybook?.step_relations.splice(relation, 1);
  if (childStep) state.currentPlaybook?.steps.splice(childStep, 1);
};
