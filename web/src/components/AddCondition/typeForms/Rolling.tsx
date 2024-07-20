import React from "react";
import useEdgeConditions from "../../../hooks/useEdgeConditions.ts";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../../store/features/drawers/drawersSlice.ts";
import { HandleTypesPropTypes } from "../HandleTypes.tsx";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";

function Rolling({ condition, conditionIndex, rule }: HandleTypesPropTypes) {
  const { id } = useSelector(additionalStateSelector);
  const { handleCondition } = useEdgeConditions(id);
  const keyValue = condition?.type?.toLowerCase();

  const handleChange = (val: string, type: string) => {
    handleCondition(`${keyValue}.${type}`, val, conditionIndex);
  };

  return (
    <div className="flex items-center gap-1">
      <CustomInput
        inputType={InputTypes.TEXT}
        value={rule.window}
        handleChange={(val: string) => handleChange(val, "window")}
        placeholder={"Enter window size"}
        length={200}
      />
    </div>
  );
}

export default Rolling;
