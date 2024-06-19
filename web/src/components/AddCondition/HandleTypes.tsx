import React from "react";
import ValueComponent from "../ValueComponent";
import useEdgeConditions from "../../hooks/useEdgeConditions.ts";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import { useSelector } from "react-redux";

type HandleTypesPropTypes = {
  condition: any;
  conditionIndex: number;
};

function HandleTypes({ condition, conditionIndex }: HandleTypesPropTypes) {
  const { id } = useSelector(additionalStateSelector);
  const { handleCondition } = useEdgeConditions(id);
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
      return <></>;
    default:
      return <></>;
  }
}

export default HandleTypes;
