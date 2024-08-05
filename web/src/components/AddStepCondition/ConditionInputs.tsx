import CustomInput from "../Inputs/CustomInput";
import { InputTypes, StepRule, StepRuleTypes } from "../../types";
import { operationOptions } from "../../utils/conditionals/operationOptions";
import useIsPrefetched from "../../hooks/playbooks/useIsPrefetched";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../store/features/drawers/selectors";
import useEdgeConditions from "../../hooks/playbooks/useEdgeConditions";
import { RuleType } from "../common/Conditions/types";

type ConditionInputsPropTypes = {
  rule: StepRule;
  ruleIndex: number;
};

function ConditionInputs({ rule, ruleIndex }: ConditionInputsPropTypes) {
  const { id } = useSelector(additionalStateSelector);
  const { handleRule } = useEdgeConditions(id);
  const isPrefetched = useIsPrefetched();
  const ruleType = rule.type?.toLowerCase() as StepRuleTypes;
  const ruleData = rule?.[ruleType];

  const handleChange = (val: string | undefined, type: string) => {
    handleRule(type, val, ruleIndex, RuleType.STEP_RULE);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <CustomInput
        inputType={InputTypes.TEXT}
        error={undefined}
        options={operationOptions}
        value={ruleData.rule}
        placeholder={`Enter CRON Rule`}
        handleChange={(id: string) => handleChange(id, `${ruleType}.rule`)}
        disabled={!!isPrefetched}
      />
    </div>
  );
}

export default ConditionInputs;
