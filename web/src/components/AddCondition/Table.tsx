import React from "react";
import SelectComponent from "../SelectComponent";
import ValueComponent from "../ValueComponent";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import useEdgeConditions from "../../hooks/useEdgeConditions.ts";
import { operationOptions } from "../../utils/conditionals/operationOptions.ts";
import { tableOptions } from "../../utils/conditionals/typeOptions/index.ts";
import HandleTypes from "./HandleTypes.tsx";

function Table({ condition, conditionIndex, rule }) {
  const { id } = useSelector(additionalStateSelector);
  const { handleCondition } = useEdgeConditions(id);

  const handleChange = (val: string | undefined, type: string) => {
    handleCondition(type, val, conditionIndex);
  };

  const checkIfNumeric = rule.isNumeric || rule.type === "ROW_COUNT";

  const threshold = checkIfNumeric
    ? rule.numeric_value_threshold
    : rule.string_value_threshold;

  return (
    <>
      <div className="flex items-center gap-1">
        <SelectComponent
          error={undefined}
          data={tableOptions}
          selected={rule.type}
          placeholder={`Select Type`}
          onSelectionChange={(id: string) =>
            handleChange(id, `${condition.type?.toLowerCase()}.type`)
          }
        />
      </div>

      <HandleTypes
        condition={condition}
        rule={rule}
        conditionIndex={conditionIndex}
      />

      <div className="flex items-center gap-1">
        <SelectComponent
          error={undefined}
          data={
            checkIfNumeric
              ? operationOptions
              : operationOptions.filter((e) => e.id === "EQUAL_O")
          }
          selected={rule.operator}
          placeholder={`Select Operator`}
          onSelectionChange={(id: string) =>
            handleChange(id, `${condition.type?.toLowerCase()}.operator`)
          }
        />
      </div>

      <div className="flex flex-col gap-1">
        <ValueComponent
          error={undefined}
          valueType={"STRING"}
          onValueChange={(val: string) => {
            if (checkIfNumeric) {
              handleChange(
                undefined,
                `${condition.type?.toLowerCase()}.string_value_threshold`,
              );
              handleChange(
                val,
                `${condition.type?.toLowerCase()}.numeric_value_threshold`,
              );
            } else {
              handleChange(
                undefined,
                `${condition.type?.toLowerCase()}.numeric_value_threshold`,
              );
              handleChange(
                val,
                `${condition.type?.toLowerCase()}.string_value_threshold`,
              );
            }
          }}
          value={threshold}
          valueOptions={[]}
          placeHolder={"Enter threshold of condition"}
          length={200}
        />
      </div>
    </>
  );
}

export default Table;
