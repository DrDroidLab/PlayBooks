import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types";
import { OperatorOptions } from "../../../../../utils/conditionals/types/operatorOptionTypes";
import { playbookSlice } from "../../playbookSlice";

export const addVariableRuleAction = (
  state: PlaybookUIState,
  {
    payload,
  }: PayloadAction<{
    id: string;
    ruleSetIndex: number;
  }>,
) => {
  const { id, ruleSetIndex } = payload;
  const relation = state.currentPlaybook?.step_relations.find(
    (e) => e.id === id,
  );
  if (!relation || !relation.condition) return;
  if (
    !relation.condition.rule_sets ||
    (relation.condition.rule_sets?.length ?? 0) === 0
  )
    playbookSlice.caseReducers.addStepRuleSet(state, {
      payload: { id },
      type: "",
    });
  const ruleSet = relation.condition.rule_sets[ruleSetIndex];
  if (!ruleSet.variable_rules) ruleSet.variable_rules = [];
  ruleSet.variable_rules.push({
    operator: OperatorOptions.EQUAL_O,
    variable_name: "",
    threshold: "",
  });
};
