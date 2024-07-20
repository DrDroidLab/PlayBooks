import React from "react";
import { HandleTypesPropTypes } from "../HandleTypes.tsx";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../../store/features/drawers/drawersSlice.ts";
import useEdgeConditions from "../../../hooks/useEdgeConditions.ts";
import { addConditionToEdgeByIndex } from "../../../utils/conditionals/addConditionToEdgeByIndex.ts";
import Checkbox from "../../common/Checkbox/index.tsx";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";

function ColumnValue({
  condition,
  conditionIndex,
  rule,
}: HandleTypesPropTypes) {
  const { id } = useSelector(additionalStateSelector);
  const { handleCondition, edgeIndex } = useEdgeConditions(id);
  const keyValue = condition?.type?.toLowerCase();

  const handleChange = (val: string, type: string) => {
    handleCondition(`${keyValue}.${type}`, val, conditionIndex);
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
        />
        <Checkbox
          id="isNumeric"
          isChecked={rule.isNumeric}
          onChange={() => {
            addConditionToEdgeByIndex(
              `${keyValue}.isNumeric`,
              !rule.isNumeric,
              edgeIndex,
              conditionIndex,
            );
          }}
          label="Is Numeric"
          isSmall={true}
        />
      </div>
    </>
  );
}

export default ColumnValue;
