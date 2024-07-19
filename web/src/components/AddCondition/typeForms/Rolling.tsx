import React from "react";
import ValueComponent from "../../ValueComponent";
import useEdgeConditions from "../../../hooks/useEdgeConditions.ts";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../../store/features/drawers/drawersSlice.ts";
import { HandleTypesPropTypes } from "../HandleTypes.tsx";

function Rolling({ condition, conditionIndex, rule }: HandleTypesPropTypes) {
  const { id } = useSelector(additionalStateSelector);
  const { handleCondition } = useEdgeConditions(id);
  const keyValue = condition?.type?.toLowerCase();

  const handleChange = (val: string, type: string) => {
    handleCondition(`${keyValue}.${type}`, val, conditionIndex);
  };

  return (
    <div className="flex items-center gap-1">
      <ValueComponent
        valueType={"STRING"}
        onValueChange={(val: string) => handleChange(val, "window")}
        value={rule.window}
        valueOptions={[]}
        placeHolder={"Enter window size"}
        length={200}
        error={undefined}
      />
    </div>
  );
}

export default Rolling;
