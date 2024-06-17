import React from "react";
import { functionOptions } from "../../utils/conditionals/functionOptions.ts";
import SelectComponent from "../SelectComponent/index.jsx";
import useCurrentStep from "../../hooks/useCurrentStep.ts";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";

function AddCondition() {
  const additionalData = useSelector(additionalStateSelector);
  const [parentStep] = useCurrentStep(additionalData.source);

  return (
    <div className="p-2">
      <h1 className="text-violet-500 font-semibold text-sm flex justify-between my-2">
        <span>Add Condition</span>
      </h1>

      <div className="flex">
        <SelectComponent
          data={functionOptions(parentStep)}
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
