import React from "react";
import ValueComponent from "../ValueComponent";
import useEdgeConditions from "../../hooks/useEdgeConditions.ts";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import { useSelector } from "react-redux";
import Checkbox from "../common/Checkbox/index.tsx";
import { addConditionToEdgeByIndex } from "../../utils/conditionals/addConditionToEdgeByIndex.ts";

type HandleTypesPropTypes = {
  condition: any;
  conditionIndex: number;
};

function HandleTypes({ condition, conditionIndex }: HandleTypesPropTypes) {
  const { id } = useSelector(additionalStateSelector);
  const { handleCondition, edgeIndex } = useEdgeConditions(id);
  const type = condition.type;

  const handleChange = (val: string, type: string) => {
    handleCondition(type, val, conditionIndex);
  };

  switch (type) {
    case "ROLLING":
      return (
        <div className="flex items-center gap-1">
          {/* <p className="text-xs text-violet-500 font-semibold">Value</p> */}
          <ValueComponent
            valueType={"STRING"}
            onValueChange={(val: string) => handleChange(val, "window")}
            value={condition.window}
            valueOptions={[]}
            placeHolder={"Enter window size"}
            length={200}
          />
        </div>
      );
    case "CUMULATIVE":
      return <></>;
    case "ROW_COUNT":
      return <></>;
    case "COLUMN_VALUE":
      return (
        <>
          <div className="flex flex-wrap gap-2 items-center">
            <ValueComponent
              valueType={"STRING"}
              onValueChange={(val: string) => handleChange(val, "columnName")}
              value={condition.columnName}
              valueOptions={[]}
              placeHolder={"Enter column name"}
              length={200}
            />
            <Checkbox
              id="isNumeric"
              isChecked={condition.isNumeric}
              onChange={() => {
                addConditionToEdgeByIndex(
                  "isNumeric",
                  !condition.isNumeric,
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
    default:
      return <></>;
  }
}

export default HandleTypes;
