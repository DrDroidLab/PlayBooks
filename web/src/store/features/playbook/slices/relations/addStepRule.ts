import { PayloadAction } from "@reduxjs/toolkit";
import {
  LowercaseString,
  PlaybookUIState,
  StepRuleTypes,
} from "../../../../../types";
import { OperatorOptions } from "../../../../../utils/conditionals/types/operatorOptionTypes";

export const addStepRule = (
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
  if (!relation.condition.step_rules) relation.condition.step_rules = [];
  relation.condition.step_rules.push({
    type: StepRuleTypes.COMPARE_TIME_WITH_CRON,
    [StepRuleTypes.COMPARE_TIME_WITH_CRON.toLowerCase() as LowercaseString<StepRuleTypes>]:
      {
        operator: OperatorOptions.GREATER_THAN_EQUAL_O,
        rule: "",
        within_seconds: 0,
      },
  });
};
