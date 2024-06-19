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
import Checkbox from "../common/Checkbox/index.tsx";
import { addConditionToEdgeByIndex } from "../../utils/conditionals/addConditionToEdgeByIndex.ts";

function Table({ condition, conditionIndex }) {
  const { source, id } = useSelector(additionalStateSelector);
  const { handleCondition, edgeIndex } = useEdgeConditions(id);
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

      <div className="flex items-center gap-1">
        {/* <p className="text-xs text-violet-500 font-semibold">Operation</p> */}
        <SelectComponent
          data={operationOptions}
          selected={condition.operation}
          placeholder={`Select Operator`}
          onSelectionChange={(id: string) => handleChange(id, "operation")}
        />
      </div>

      <div className="flex flex-col gap-1">
        {/* <p className="text-xs text-violet-500 font-semibold">Value</p> */}
        <div className="flex flex-wrap gap-2 items-center">
          <ValueComponent
            valueType={"STRING"}
            onValueChange={(val: string) => handleChange(val, "columnName")}
            value={condition.value}
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

        <ValueComponent
          valueType={"STRING"}
          onValueChange={(val: string) => handleChange(val, "threshold")}
          value={condition.value}
          valueOptions={[]}
          placeHolder={"Enter threshold of condition"}
          length={200}
        />
      </div>

      <div className="flex items-center gap-1">
        {/* <p className="text-xs text-violet-500 font-semibold">Value</p> */}
      </div>
    </>
  );
}

export default Table;
