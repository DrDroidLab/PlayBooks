import { RuleType } from "../../components/common/Conditions/types/RuleTypes.ts";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import { currentPlaybookSelector } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";
import handleDefaults from "./defaults/handleDefaults.ts";
import { handleRelationRuleChange } from "./handleRelationRuleChange.ts";
import { bashCommandOutputOptions } from "./typeOptions/bash.ts";
import { RuleTypes } from "./types/ruleTypes.ts";

type ValueType = {
  key: string;
  value: any;
};

function handleRuleDefaults(rule: any, conditionIndex: number, condition: any) {
  const { id } = additionalStateSelector(store.getState());
  const currentPlaybook = currentPlaybookSelector(store.getState());
  const relations = currentPlaybook?.step_relations ?? [];
  const edgeIndex = relations?.findIndex((e) => e.id === id);
  let values: ValueType[] = [];
  const keyValue = condition?.type?.toLowerCase();

  const setValue = (key: string, value: any) => {
    handleRelationRuleChange(
      `${keyValue}.${key}`,
      value,
      edgeIndex,
      conditionIndex,
      RuleType.RULE,
    );
  };

  switch (rule.type) {
    case RuleTypes.GREP:
    case RuleTypes.NO_GREP:
    case RuleTypes.GREP_COUNT:
      values = handleDefaults(rule.type, bashCommandOutputOptions);
      break;
    default:
      return;
  }

  values.forEach((v) => setValue(v.key, v.value));
}

export default handleRuleDefaults;
