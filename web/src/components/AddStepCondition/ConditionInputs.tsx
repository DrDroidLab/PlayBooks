import CustomInput from "../Inputs/CustomInput";
import { InputTypes, StepRule } from "../../types";
import { operationOptions } from "../../utils/conditionals/operationOptions";
import useIsPrefetched from "../../hooks/playbooks/useIsPrefetched";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../store/features/drawers/selectors";
import useEdgeConditions from "../../hooks/playbooks/useEdgeConditions";

type ConditionInputsPropTypes = {
  rule: StepRule;
  ruleIndex: number;
};

function ConditionInputs({ rule, ruleIndex }: ConditionInputsPropTypes) {
  const { id } = useSelector(additionalStateSelector);
  const { handleStepRule } = useEdgeConditions(id);
  const isPrefetched = useIsPrefetched();

  const handleChange = (val: string | undefined, type: string) => {
    if (!val) return;
    handleStepRule(type, val, ruleIndex);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <CustomInput
        inputType={InputTypes.DROPDOWN}
        error={undefined}
        options={operationOptions}
        value={""}
        label="Operator"
        handleChange={(id: string) =>
          handleChange(id, `${rule.type?.toLowerCase()}.operator`)
        }
        disabled={!!isPrefetched}
      />
      <CustomInput
        inputType={InputTypes.TEXT}
        error={undefined}
        options={operationOptions}
        value={""}
        label="CRON Rule"
        placeholder={`Enter CRON Rule`}
        handleChange={(id: string) =>
          handleChange(id, `${rule.type?.toLowerCase()}.rule`)
        }
        disabled={!!isPrefetched}
      />
      <CustomInput
        inputType={InputTypes.TEXT}
        error={undefined}
        type="number"
        options={operationOptions}
        value={""}
        label="Within Seconds"
        handleChange={(id: string) =>
          handleChange(id, `${rule.type?.toLowerCase()}.within_seconds`)
        }
        disabled={!!isPrefetched}
      />
    </div>
  );
}

export default ConditionInputs;
