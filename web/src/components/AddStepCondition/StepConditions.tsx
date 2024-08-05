import { StepRule } from "../../types";
import ConditionInputs from "./ConditionInputs";
import { RuleType } from "../common/Conditions/types";
import DeleteRuleButton from "../common/Conditions/DeleteRuleButton";

type StepConditionsPropTypes = {
  rule: StepRule;
  ruleIndex: number;
  showDelete?: boolean;
};

function StepConditions({
  showDelete = true,
  ...props
}: StepConditionsPropTypes) {
  return (
    <div className="mt-2 flex gap-2">
      <ConditionInputs {...props} />
      {showDelete && (
        <DeleteRuleButton
          ruleType={RuleType.STEP_RULE}
          ruleIndex={props.ruleIndex}
        />
      )}
    </div>
  );
}

export default StepConditions;
