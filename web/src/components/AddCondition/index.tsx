import React from "react";
import { CloseRounded } from "@mui/icons-material";
import { updateCardByIndex } from "../../utils/execution/updateCardByIndex.ts";
import { functionOptions } from "../../utils/conditionals/functionOptions.ts";
import SelectComponent from "../SelectComponent/index.jsx";

function AddCondition({ step }) {
  const handleClose = () => {
    updateCardByIndex("requireCondition", false, step.stepIndex);
    updateCardByIndex("currentConditionParentIndex", undefined, step.stepIndex);
  };

  return (
    <div className="bg-white rounded-md p-2 shadow-md w-[200px] overflow-visible">
      <h1 className="text-violet-500 font-semibold text-sm flex justify-between my-2">
        <span>Add Condition</span>
        <div onClick={handleClose} className="cursor-pointer">
          <CloseRounded fontSize="small" />
        </div>
      </h1>

      <div>
        <SelectComponent
          data={functionOptions(step)}
          selected={""}
          placeholder={`Select Function`}
          onSelectionChange={(id, val) => {}}
          containerClassName={""}
        />
      </div>
    </div>
  );
}

export default AddCondition;
