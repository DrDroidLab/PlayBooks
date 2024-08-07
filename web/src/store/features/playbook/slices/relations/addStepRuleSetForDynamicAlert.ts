import { LogicalOperator, PlaybookUIState } from "../../../../../types";
import generateUUIDWithoutHyphens from "../../../../../utils/common/generateUUIDWithoutHyphens";
import { playbookSlice } from "../../playbookSlice";

export const addStepRuleSetForDynamicAlert = (state: PlaybookUIState) => {
  const relation = JSON.parse(
    JSON.stringify(state.currentPlaybook?.step_relations[0]),
  );
  if (!relation || !relation.condition) return;
  relation.id = generateUUIDWithoutHyphens();
  relation.child = undefined;
  relation.condition.rule_sets = [];
  if (!relation.condition.rule_sets) relation.condition.rule_sets = [];
  relation.condition.rule_sets.push({
    rules: [],
    step_rules: [],
    logical_operator: LogicalOperator.AND_LO,
  });
  state.currentPlaybook?.step_relations.push(relation);

  const ruleSetIndex = relation.condition.rule_sets.length - 1;

  playbookSlice.caseReducers.addRuleForDynamicAlert(state, {
    payload: {
      id: relation.id,
      ruleSetIndex,
    },
    type: "",
  });
  playbookSlice.caseReducers.addStepRule(state, {
    payload: {
      id: relation.id,
      ruleSetIndex,
    },
    type: "",
  });
};
