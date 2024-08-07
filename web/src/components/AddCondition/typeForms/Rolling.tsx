import useEdgeConditions from "../../../hooks/playbooks/useEdgeConditions.ts";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../../store/features/drawers/drawersSlice.ts";
import { HandleTypesPropTypes } from "../HandleTypes.tsx";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";
import useIsPrefetched from "../../../hooks/playbooks/useIsPrefetched.ts";
import { RuleType } from "../../common/Conditions/types/RuleTypes.ts";

function Rolling({ condition, conditionIndex, rule }: HandleTypesPropTypes) {
  const { id } = useSelector(additionalStateSelector);
  const { handleRule } = useEdgeConditions(id);
  const keyValue = condition?.type?.toLowerCase();
  const isPrefetched = useIsPrefetched();

  const handleChange = (val: string, type: string) => {
    handleRule(`${keyValue}.${type}`, val, conditionIndex, RuleType.RULE);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CustomInput
        inputType={InputTypes.TEXT}
        value={rule.window}
        handleChange={(val: string) => handleChange(val, "window")}
        placeholder={"Enter window size"}
        className="!w-[200px]"
        disabled={!!isPrefetched}
      />
    </div>
  );
}

export default Rolling;
