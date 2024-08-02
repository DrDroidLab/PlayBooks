import { RuleType } from "../../components/common/Conditions/types";
import { addRuleToRelationByIndex } from "./addRuleToRelationByIndex";
import { addStepRuleToRelationByIndex } from "./addStepRuleToRelationByIndex";

export const handleRelationRuleChange = (
  key: string,
  value: any,
  index: number,
  ruleIndex: number,
  ruleType: RuleType,
) => {
  switch (ruleType) {
    case RuleType.RULE:
      addRuleToRelationByIndex(key, value, index, ruleIndex);
      break;
    case RuleType.STEP_RULE:
      addStepRuleToRelationByIndex(key, value, index, ruleIndex);
      break;
    default:
      return;
  }
};
