import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types/index.ts";
import { playbookSlice } from "../../playbookSlice.ts";

export const addRule = (
  state: PlaybookUIState,
  { payload }: PayloadAction<{ id: string; ruleSetIndex: number }>,
) => {
  const { id, ruleSetIndex } = payload;
  const relation = state.currentPlaybook?.step_relations.find(
    (e) => e.id === id,
  );
  if (!relation || !relation.condition) return;
  if (!relation.condition.rule_sets)
    playbookSlice.caseReducers.addStepRuleSet(state, {
      payload: { id },
      type: "",
    });
  const ruleSet = relation.condition.rule_sets[ruleSetIndex];
  ruleSet.rules.push({
    type: "",
    task: {
      reference_id: "",
      id: "",
    },
  });
};
