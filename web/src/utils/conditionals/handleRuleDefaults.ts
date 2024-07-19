import { addConditionToEdgeByIndex } from "./addConditionToEdgeByIndex";
import { RuleTypes, RuleTypesType } from "./types/ruleTypes.ts";

function handleRuleDefaults(type: RuleTypesType, id: string) {
  const setValue = () => {
    // addConditionToEdgeByIndex("key", "value", "index", "conditionIdnex");
  };

  switch (type) {
    case RuleTypes.GREP_COUNT:
      return;
    default:
      return;
  }
}

export default handleRuleDefaults;
