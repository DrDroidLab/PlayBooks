import { RuleType } from "../../components/common/Conditions/types";
import { addRuleToRelationByIndex } from "./addRuleToRelationByIndex";
import { addStepRuleToRelationByIndex } from "./addStepRuleToRelationByIndex";
import { addVariableRuleToRelationByIndex } from "./addVariableRuleToRelationByIndex";

export const handleRelationRuleChange = (
  key: string,
  value: any,
  index: number,
  ruleIndex: number,
  ruleType: RuleType,
  ruleSetIndex: number = 0,
) => {
  switch (ruleType) {
    case RuleType.RULE:
      addRuleToRelationByIndex(key, value, index, ruleIndex, ruleSetIndex);
      break;
    case RuleType.STEP_RULE:
      addStepRuleToRelationByIndex(key, value, index, ruleIndex, ruleSetIndex);
      break;
    case RuleType.VARIABLE_RULE:
      addVariableRuleToRelationByIndex(
        key,
        value,
        index,
        ruleIndex,
        ruleSetIndex,
      );
      break;
    default:
      return;
  }
};
