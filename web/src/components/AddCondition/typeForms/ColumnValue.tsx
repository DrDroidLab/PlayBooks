import { HandleTypesPropTypes } from "../HandleTypes.tsx";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../../store/features/drawers/drawersSlice.ts";
import useEdgeConditions from "../../../hooks/playbooks/useEdgeConditions.ts";
import Checkbox from "../../common/Checkbox/index.tsx";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";
import useIsPrefetched from "../../../hooks/playbooks/useIsPrefetched.ts";
import { RuleType } from "../../common/Conditions/types/RuleTypes.ts";

function ColumnValue({
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
    <>
      <div className="flex flex-wrap gap-2 items-center">
        <CustomInput
          inputType={InputTypes.TEXT}
          value={rule.column_name}
          handleChange={(val: string) => handleChange(val, "column_name")}
          placeholder={"Enter column name"}
          className="!w-[200px]"
          disabled={!!isPrefetched}
        />
        <Checkbox
          id="isNumeric"
          isChecked={rule.isNumeric}
          onChange={() => {
            handleChange(!rule.isNumeric, "isNumeric");
          }}
          disabled={!!isPrefetched}
          label="Is Numeric"
          isSmall={true}
        />
      </div>
    </>
  );
}

export default ColumnValue;
