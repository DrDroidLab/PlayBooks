import React from "react";
import ValueComponent from "../../ValueComponent";
import { HandleTypesPropTypes } from "../HandleTypes.tsx";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../../store/features/drawers/drawersSlice.ts";
import useEdgeConditions from "../../../hooks/useEdgeConditions.ts";
import { addConditionToEdgeByIndex } from "../../../utils/conditionals/addConditionToEdgeByIndex.ts";
import Checkbox from "../../common/Checkbox/index.tsx";

function ColumnValue({
  condition,
  conditionIndex,
  rule,
}: HandleTypesPropTypes) {
  const { id, edgeIndex } = useSelector(additionalStateSelector);
  const { handleCondition } = useEdgeConditions(id);
  const keyValue = condition?.type?.toLowerCase();

  const handleChange = (val: string, type: string) => {
    handleCondition(`${keyValue}.${type}`, val, conditionIndex);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center">
        <ValueComponent
          valueType={"STRING"}
          onValueChange={(val: string) => handleChange(val, "column_name")}
          value={rule.column_name}
          valueOptions={[]}
          placeHolder={"Enter column name"}
          length={200}
          error={undefined}
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
