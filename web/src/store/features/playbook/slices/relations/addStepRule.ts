import { PayloadAction } from "@reduxjs/toolkit";
import {
  LowercaseString,
  PlaybookUIState,
  StepRuleTypes,
} from "../../../../../types";
import { OperatorOptions } from "../../../../../utils/conditionals/types/operatorOptionTypes";
import { playbookSlice } from "../../playbookSlice";

export const addStepRule = (
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
  if (!relation.condition.rule_sets)
    playbookSlice.caseReducers.addRule(state, {
      payload: { id },
      type: "",
    });
  const ruleSet = relation.condition.rule_sets[ruleSetIndex];
  if (!ruleSet.step_rules) ruleSet.step_rules = [];
  ruleSet.step_rules.push({
    type: StepRuleTypes.COMPARE_TIME_WITH_CRON,
    [StepRuleTypes.COMPARE_TIME_WITH_CRON.toLowerCase() as LowercaseString<StepRuleTypes>]:
      {
        operator: OperatorOptions.EQUAL_O,
        rule: "",
        within_seconds: 0,
      },
  });
};
