import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types";

export const removeStepRuleSetForDynamicAlert = (
  state: PlaybookUIState,
  { payload }: PayloadAction<string>,
) => {
  const relation = state.currentPlaybook?.step_relations.findIndex(
    (e) => e.id === payload,
  );
  if (!relation) return;
  state.currentPlaybook?.step_relations.splice(relation, 1);
};
