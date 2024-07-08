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

  const handleChange = (val: string, type: string) => {
    handleCondition(type, val, conditionIndex);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <SelectComponent
          data={tableOptions}
          selected={rule.type}
          placeholder={`Select Type`}
          onSelectionChange={(id: string) =>
            handleChange(id, `${condition.type?.toLowerCase()}.type`)
          }
        />
      </div>

      <HandleTypes condition={condition} conditionIndex={conditionIndex} />

      <div className="flex items-center gap-1">
        {/* <p className="text-xs text-violet-500 font-semibold">Operation</p> */}
        <SelectComponent
          data={
            rule.isNumeric || rule.type === "ROW_COUNT"
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
          onValueChange={(val: string) =>
            handleChange(val, `${condition.type?.toLowerCase()}.threshold`)
          }
          value={rule.numeric_value_threshold}
          valueOptions={[]}
          placeHolder={"Enter threshold of condition"}
          length={200}
        />
      </div>
    </>
  );
}

export default Table;
