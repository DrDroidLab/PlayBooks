import React from "react";
import SelectComponent from "../SelectComponent/index.jsx";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import useEdgeConditions from "../../hooks/useEdgeConditions.ts";
import { bashCommandOutputOptions } from "../../utils/conditionals/typeOptions/index.ts";
import HandleTypes from "./HandleTypes.tsx";

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
        <SelectComponent
          error={undefined}
          data={bashCommandOutputOptions}
          selected={rule.type_id}
          placeholder={`Select Type`}
          onSelectionChange={(id: string) => {
            const option = bashCommandOutputOptions.find((e) => e.id === id);
            if (!option) return;
            handleChange(option.type, `${keyValue}.type`);
            handleChange(option.id, `${keyValue}.type_id`);
          }}
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
