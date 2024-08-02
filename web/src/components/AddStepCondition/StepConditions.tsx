import { StepRule } from "../../types";
import ConditionInputs from "./ConditionInputs";
import DeleteRuleButton from "../common/Conditions/DeleteRuleButton";
import { RuleType } from "../common/Conditions/types";

type StepConditionsPropTypes = {
  rule: StepRule;
  ruleIndex: number;
};

function StepConditions(props: StepConditionsPropTypes) {
  return (
    <div className="mt-2 border p-1 rounded-md flex flex-col gap-2">
      <p className="text-xs text-violet-500 font-semibold">Step Condition</p>
      <ConditionInputs {...props} />
      <DeleteRuleButton
        ruleType={RuleType.STEP_RULE}
        ruleIndex={props.ruleIndex}
      />
    </div>
  );
}

export default StepConditions;
