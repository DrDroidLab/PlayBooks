import React from "react";
import SelectComponent from "../SelectComponent";
import ValueComponent from "../ValueComponent";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import useEdgeConditions from "../../hooks/useEdgeConditions.ts";
import extractNumbers from "../../utils/extractNumbers.ts";
import useCurrentStep from "../../hooks/useCurrentStep.ts";
import handleTaskTypeOptions from "../../utils/conditionals/handleTaskTypeOptions.ts";
import { operationOptions } from "../../utils/conditionals/operationOptions.ts";
import { tableOptions } from "../../utils/conditionals/typeOptions/index.ts";
import HandleTypes from "./HandleTypes.tsx";

function Table({ condition, conditionIndex }) {
  const { source, id } = useSelector(additionalStateSelector);
  const { handleCondition } = useEdgeConditions(id);
  const [sourceId] = extractNumbers(source);
  const [parentStep] = useCurrentStep(sourceId);
  const taskTypeOptions = handleTaskTypeOptions(parentStep);

  const handleChange = (val: string, type: string) => {
    handleCondition(type, val, conditionIndex);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <SelectComponent
          data={taskTypeOptions}
          selected={condition.task}
          placeholder={`Select Task`}
          onSelectionChange={(id: string) => handleChange(id, "task")}
        />
      </div>

      <div className="flex items-center gap-1">
        <SelectComponent
          data={tableOptions}
          selected={condition.type}
          placeholder={`Select Type`}
          onSelectionChange={(id: string) => handleChange(id, "type")}
        />
      </div>

      <HandleTypes condition={condition} conditionIndex={conditionIndex} />

      <div className="flex items-center gap-1">
        {/* <p className="text-xs text-violet-500 font-semibold">Operation</p> */}
        <SelectComponent
          data={
            condition.isNumeric
              ? operationOptions
              : operationOptions.filter((e) => e.id === "EQUAL_O")
          }
          selected={condition.operation}
          placeholder={`Select Operator`}
          onSelectionChange={(id: string) => handleChange(id, "operation")}
        />
      </div>

      <div className="flex flex-col gap-1">
        <ValueComponent
          valueType={"STRING"}
          onValueChange={(val: string) => handleChange(val, "value")}
          value={condition.value}
          valueOptions={[]}
          placeHolder={"Enter threshold of condition"}
          length={200}
        />
      </div>
    </>
  );
}

export default Table;
