import React from "react";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import useEdgeConditions from "../../hooks/useEdgeConditions.ts";
import { bashCommandOutputOptions } from "../../utils/conditionals/typeOptions/index.ts";
import HandleTypes from "./HandleTypes.tsx";
import CustomInput from "../Inputs/CustomInput.tsx";
import { InputTypes } from "../../types/inputs/inputTypes.ts";

function BashCommandOutput({ rule, condition, conditionIndex }) {
  const { id } = useSelector(additionalStateSelector);
  const { handleCondition } = useEdgeConditions(id);
  const keyValue = condition?.type?.toLowerCase();

  const handleChange = (val: string | undefined, type: string) => {
    handleCondition(type, val, conditionIndex);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <CustomInput
          inputType={InputTypes.DROPDOWN}
          error={undefined}
          options={bashCommandOutputOptions}
          value={rule.type}
          placeholder={`Select Type`}
          handleChange={(id: string) => handleChange(id, `${keyValue}.type`)}
        />
      </div>

      <HandleTypes
        condition={condition}
        rule={rule}
        conditionIndex={conditionIndex}
      />
    </>
  );
}

export default BashCommandOutput;
