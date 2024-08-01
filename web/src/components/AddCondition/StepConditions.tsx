import useEdgeConditions from "../../hooks/playbooks/useEdgeConditions";
import useIsPrefetched from "../../hooks/playbooks/useIsPrefetched";
import { InputTypes, StepRule } from "../../types";
import { operationOptions } from "../../utils/conditionals/operationOptions";
import CustomInput from "../Inputs/CustomInput";

type StepConditionsPropTypes = {
  rule: StepRule;
  ruleIndex: number;
  id: string;
};

function StepConditions({ rule, ruleIndex, id }: StepConditionsPropTypes) {
  const { handleStepRule } = useEdgeConditions(id);
  const isPrefetched = useIsPrefetched();

  const handleChange = (val: string | undefined, type: string) => {
    if (!val) return;
    handleStepRule(type, val, ruleIndex);
  };

  return (
    <div className="mt-2 border p-1 rounded-md flex flex-col gap-2">
      <p className="text-xs text-violet-500 font-semibold">Step Condition</p>
      <CustomInput
        inputType={InputTypes.DROPDOWN}
        error={undefined}
        options={operationOptions}
        value={""}
        placeholder={`Select Operator`}
        handleChange={(id: string) =>
          handleChange(id, `${rule.type?.toLowerCase()}.operator`)
        }
        disabled={!!isPrefetched}
      />
    </div>
  );
}

export default StepConditions;
