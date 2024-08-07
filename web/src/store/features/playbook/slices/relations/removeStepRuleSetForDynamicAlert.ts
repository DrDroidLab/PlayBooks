import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types";

export const removeStepRuleSetForDynamicAlert = (
  state: PlaybookUIState,
  { payload }: PayloadAction<number>,
) => {
  const relation = state.currentPlaybook?.step_relations[0];
  if (!relation || !relation.condition) return;
  if (!relation.condition.rule_sets) return;
  if (payload < 0 || payload >= relation.condition.rule_sets.length) return;

  relation.condition.rule_sets.splice(payload, 1);
};
