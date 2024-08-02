import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../../store/features/drawers/drawersSlice.ts";
import useEdgeConditions from "../../../hooks/playbooks/useEdgeConditions.ts";
import { HandleTypesPropTypes } from "../HandleTypes.tsx";
import Checkbox from "../../common/Checkbox/index.tsx";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";
import useIsPrefetched from "../../../hooks/playbooks/useIsPrefetched.ts";
import { RuleType } from "../../common/Conditions/types/RuleTypes.ts";

function GrepExistence({
  condition,
  conditionIndex,
  rule,
}: HandleTypesPropTypes) {
  const { id } = useSelector(additionalStateSelector);
  const { handleRule } = useEdgeConditions(id);
  const keyValue = condition?.type?.toLowerCase();
  const isPrefetched = useIsPrefetched();

  const handleChange = (val: any, type: string) => {
    handleRule(`${keyValue}.${type}`, val, conditionIndex, RuleType.RULE);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CustomInput
        inputType={InputTypes.TEXT}
        value={rule.pattern}
        handleChange={(val: string) => handleChange(val, `pattern`)}
        placeholder={"Enter pattern to evaluate"}
        className="!w-[200px]"
        disabled={!!isPrefetched}
      />
      <Checkbox
        id="case_sensitive"
        isChecked={rule.case_sensitive}
        onChange={() => {
          handleChange(!rule.case_sensitive, "case_sensitive");
        }}
        label="Pattern is Case Sensitive"
        isSmall={true}
        disabled={!!isPrefetched}
      />
    </div>
  );
}

export default GrepExistence;
