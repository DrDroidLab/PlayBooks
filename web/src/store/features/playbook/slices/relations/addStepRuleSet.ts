import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types";

export const addStepRuleSet = (
  state: PlaybookUIState,
  {
    payload,
  }: PayloadAction<{
    id: string;
  }>,
) => {
  const { id } = payload;
  const relation = state.currentPlaybook?.step_relations.find(
    (e) => e.id === id,
  );
  if (!relation || !relation.condition) return;
  if (!relation.condition.rule_sets) relation.condition.rule_sets = [];
  relation.condition.rule_sets.push({
    rules: [],
  });
};
