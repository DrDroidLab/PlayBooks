import { useDispatch, useSelector } from "react-redux";
import { additionalStateSelector } from "../../../store/features/drawers/selectors";
import useEdgeConditions from "../../../hooks/playbooks/useEdgeConditions";
import CustomInput from "../../Inputs/CustomInput";
import { InputTypes, StepRuleTypes } from "../../../types";
import { functionOptions } from "../../../utils/conditionals/functionOptions";
import { ResultTypeTypes } from "../../../utils/conditionals/resultTypeOptions";
import { RuleType } from "../../common/Conditions/types";
import { operationOptions } from "../../../utils/conditionals/operationOptions";
import CustomButton from "../../common/CustomButton";
import { DeleteRounded } from "@mui/icons-material";
import { removeStepRuleSetForDynamicAlert } from "../../../store/features/playbook/playbookSlice";

type ConditionRuleSetProps = {
  ruleSetIndex: number;
};

const RULE_INDEX = 0;
const RULE_KEY = "timeseries";
const STEP_RULE_KEY = StepRuleTypes.COMPARE_TIME_WITH_CRON.toLowerCase();

function ConditionRuleSet({ ruleSetIndex }: ConditionRuleSetProps) {
  const { id } = useSelector(additionalStateSelector);
  const dispatch = useDispatch();
  const { rules, step_rules, handleRule } = useEdgeConditions(id, ruleSetIndex);
  const rule = rules?.[RULE_INDEX]?.[RULE_KEY];
  const stepRule = step_rules?.[RULE_INDEX]?.[STEP_RULE_KEY];

  const handleRuleChange = (val: any, key: string) => {
    handleRule(`${RULE_KEY}.${key}`, val, RULE_INDEX, RuleType.RULE);
  };

  const handleStepRuleChange = (val: any, key: string) => {
    handleRule(`${STEP_RULE_KEY}.${key}`, val, RULE_INDEX, RuleType.STEP_RULE);
  };

  const handleDeleteRuleSet = () => {
    dispatch(removeStepRuleSetForDynamicAlert(ruleSetIndex));
  };

  if (!rule || !stepRule) return;

  return (
    <div className="flex flex-wrap gap-2 border-b py-1 items-center">
      <CustomInput
        inputType={InputTypes.DROPDOWN}
        options={functionOptions(ResultTypeTypes.TIMESERIES)}
        value={rule.function}
        placeholder={`Function`}
        handleChange={(id: string) => handleRuleChange(id, `function`)}
      />

      <CustomInput
        inputType={InputTypes.DROPDOWN}
        options={operationOptions}
        value={rule.operator}
        placeholder={`Operator`}
        handleChange={(id: string) => handleRuleChange(id, `operator`)}
      />

      <CustomInput
        inputType={InputTypes.TEXT}
        handleChange={(val: string) => handleRuleChange(val, `threshold`)}
        value={rule.threshold}
        placeholder={"Threshold"}
        className="!w-[200px]"
      />

      <CustomInput
        inputType={InputTypes.CRON}
        error={undefined}
        options={operationOptions}
        value={stepRule.rule}
        placeholder={`Time Schedule (UTC)`}
        handleChange={(id: string) => handleStepRuleChange(id, `rule`)}
      />

      {ruleSetIndex > 0 && (
        <CustomButton className="w-fit" onClick={handleDeleteRuleSet}>
          <DeleteRounded fontSize="small" />
        </CustomButton>
      )}
    </div>
  );
}

export default ConditionRuleSet;
