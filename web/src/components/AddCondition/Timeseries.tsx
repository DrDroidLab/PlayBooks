import React from "react";
import SelectComponent from "../SelectComponent";
import { functionOptions } from "../../utils/conditionals/functionOptions.ts";
import useEdgeConditions from "../../hooks/useEdgeConditions.ts";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import { useSelector } from "react-redux";
import ValueComponent from "../ValueComponent/index.jsx";
import handleTaskTypeOptions from "../../utils/conditionals/handleTaskTypeOptions.ts";
import extractNumbers from "../../utils/extractNumbers.ts";
import useCurrentStep from "../../hooks/useCurrentStep.ts";
import { operationOptions } from "../../utils/conditionals/operationOptions.ts";
import { timeseriesOptions } from "../../utils/conditionals/typeOptions/timeseries.ts";
import HandleTypes from "./HandleTypes.tsx";

function Timeseries({ condition, conditionIndex }) {
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
          data={timeseriesOptions}
          selected={condition.type}
          placeholder={`Select Type`}
          onSelectionChange={(id: string) => handleChange(id, "type")}
        />
      </div>

      <HandleTypes condition={condition} conditionIndex={conditionIndex} />

      <div className="flex items-center gap-1">
        <SelectComponent
          data={functionOptions(parentStep)}
          selected={condition.function}
          placeholder={`Select Function`}
          onSelectionChange={(id: string) => handleChange(id, "function")}
        />
      </div>

      <div className="flex items-center gap-1">
        {/* <p className="text-xs text-violet-500 font-semibold">Operation</p> */}
        <SelectComponent
          data={operationOptions}
          selected={condition.operation}
          placeholder={`Select Operator`}
          onSelectionChange={(id: string) => handleChange(id, "operation")}
        />
      </div>

      <div className="flex items-center gap-1">
        {/* <p className="text-xs text-violet-500 font-semibold">Value</p> */}
        <ValueComponent
          valueType={"STRING"}
          onValueChange={(val: string) => handleChange(val, "value")}
          value={condition.value}
          valueOptions={[]}
          placeHolder={"Enter Value of condition"}
          length={200}
        />
      </div>
    </>
  );
}

export default Timeseries;
