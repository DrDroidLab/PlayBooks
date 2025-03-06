import CustomInput from "../Inputs/CustomInput";
import {
  InputTypes,
  VariableConditionRule,
  VariableRuleTypes,
} from "../../types";
import useIsPrefetched from "../../hooks/playbooks/useIsPrefetched";
import { useSelector } from "react-redux";
import { currentPlaybookSelector } from "../../store/features/playbook/selectors";
import { additionalStateSelector } from "../../store/features/drawers/selectors";
import DeleteRuleButton from "../common/Conditions/DeleteRuleButton";
import { RuleType } from "../common/Conditions/types";
import { operationOptions } from "../../utils/conditionals/operationOptions";
import useEdgeConditions from "../../hooks/playbooks/useEdgeConditions";

type VariableConditionProps = {
  i: number;
  showDelete?: boolean;
  condition: VariableConditionRule;
};

function VariableCondition({
  i,
  condition,
  showDelete = true,
}: VariableConditionProps) {
  const { id } = useSelector(additionalStateSelector);
  const isPrefetched = useIsPrefetched();
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const { handleRule } = useEdgeConditions(id);
  const ruleType = condition.type?.toLowerCase() as VariableRuleTypes;
  const ruleData = condition?.[ruleType] ?? {};

  const handleChange = (val: string, type: string) => {
    handleRule(type, val, i, RuleType.VARIABLE_RULE);
  };

  return (
    <div key={i} className="mt-2 border p-1 rounded-md flex flex-col gap-2">
      <p className="text-xs text-violet-500 font-semibold">
        Variable Condition-{i + 1}
      </p>
      <div className="flex flex-col gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <CustomInput
            inputType={InputTypes.TYPING_DROPDOWN}
            error={undefined}
            options={Object.keys(
              currentPlaybook?.global_variable_set ?? {},
            ).map((key) => ({
              id: key,
              label: key,
            }))}
            value={ruleData.variable_name}
            placeholder={`Variable Name`}
            handleChange={(id: string) =>
              handleChange(id, `${ruleType}.variable_name`)
            }
            disabled={!!isPrefetched}
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <CustomInput
            inputType={InputTypes.DROPDOWN}
            disabled={!!isPrefetched}
            options={operationOptions}
            value={ruleData.operator}
            placeholder={`Select Operator`}
            handleChange={(id: string) =>
              handleChange(id, `${ruleType}.operator`)
            }
          />
          <CustomInput
            inputType={InputTypes.TEXT}
            disabled={!!isPrefetched}
            value={ruleData.threshold}
            placeholder={`Threshold/Value`}
            handleChange={(id: string) =>
              handleChange(id, `${ruleType}.threshold`)
            }
          />
        </div>

        {showDelete && (
          <DeleteRuleButton ruleType={RuleType.VARIABLE_RULE} ruleIndex={i} />
        )}
      </div>
    </div>
  );
}

export default VariableCondition;
