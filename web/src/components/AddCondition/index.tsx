import React from "react";
import { functionOptions } from "../../utils/conditionals/functionOptions.ts";
import SelectComponent from "../SelectComponent/index.jsx";
import useCurrentStep from "../../hooks/useCurrentStep.ts";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import { operationOptions } from "../../utils/conditionals/operationOptions.ts";
import ValueComponent from "../ValueComponent/index.jsx";
import CustomButton from "../common/CustomButton/index.tsx";
import { Add, Delete } from "@mui/icons-material";
import useEdgeConditions from "../../hooks/useEdgeConditions.ts";

function extractNumbers(input: string) {
  if (!input) return [];
  // Use regular expression to match numbers in the string
  const numbers = input.match(/\d+/g);

  // Convert the matched strings to integers
  const result = numbers ? numbers.map(Number) : [];

  return result;
}

function AddCondition() {
  const { source, target } = useSelector(additionalStateSelector);
  const { conditions, handleCondition, addNewCondition, deleteCondition } =
    useEdgeConditions(source, target);
  const [sourceId] = extractNumbers(source);
  const [parentStep] = useCurrentStep(sourceId);

  const handleChange = (val: string, type: string, index: number) => {
    handleCondition(type, val, index);
  };

  return (
    <div className="p-2">
      <h1 className="text-violet-500 font-semibold text-lg flex justify-between my-2">
        <span>Add Condition</span>
      </h1>
      <hr />

      {conditions?.map((condition, i) => (
        <div className="flex gap-2 mt-4 items-center">
          <div className="flex items-center gap-1">
            {/* <p className="text-xs text-violet-500 font-semibold">Function</p> */}
            <SelectComponent
              data={functionOptions(parentStep)}
              selected={condition.function}
              placeholder={`Select Function`}
              onSelectionChange={(id: string) =>
                handleChange(id, "function", i)
              }
            />
          </div>

          <div className="flex items-center gap-1">
            {/* <p className="text-xs text-violet-500 font-semibold">Operation</p> */}
            <SelectComponent
              data={operationOptions}
              selected={condition.operation}
              placeholder={`Select Operator`}
              onSelectionChange={(id: string) =>
                handleChange(id, "operation", i)
              }
              containerClassName={""}
            />
          </div>

          <div className="flex items-center gap-1">
            {/* <p className="text-xs text-violet-500 font-semibold">Value</p> */}
            <ValueComponent
              valueType={"STRING"}
              onValueChange={(val: string) => handleChange(val, "value", i)}
              value={condition.value}
              valueOptions={[]}
              placeHolder={"Enter Value of condition"}
              length={200}
            />
          </div>

          {conditions.length === i + 1 && (
            <CustomButton className="!text-sm !w-fit" onClick={addNewCondition}>
              <Add fontSize="inherit" />
            </CustomButton>
          )}

          <CustomButton
            className="!text-sm !w-fit"
            onClick={() => deleteCondition(i)}>
            <Delete fontSize="inherit" />
          </CustomButton>
        </div>
      ))}
    </div>
  );
}

export default AddCondition;
