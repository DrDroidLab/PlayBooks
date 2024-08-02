import CustomInput from "../../Inputs/CustomInput";
import { InputTypes } from "../../../types";
import { ruleOptions } from "../../../utils/conditionals/ruleOptions";
import useIsPrefetched from "../../../hooks/playbooks/useIsPrefetched";
import useEdgeConditions from "../../../hooks/playbooks/useEdgeConditions";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../../store/features/drawers/selectors";

function GlobalRule() {
  const { id: relationId } = useSelector(additionalStateSelector);
  const { condition, handleGlobalRule } = useEdgeConditions(relationId);
  const isPrefetched = useIsPrefetched();

  return (
    <div className="flex flex-col items-start gap-1 mt-4">
      <p className="text-xs text-violet-500 font-semibold">
        Select a global rule
      </p>
      <CustomInput
        inputType={InputTypes.DROPDOWN}
        options={ruleOptions}
        value={condition?.logical_operator ?? ""}
        placeholder={`Select Global Rule`}
        handleChange={handleGlobalRule}
        error={undefined}
        disabled={!!isPrefetched}
      />
    </div>
  );
}

export default GlobalRule;
