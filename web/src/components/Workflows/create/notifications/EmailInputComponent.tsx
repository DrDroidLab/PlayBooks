import React, { ReactNode } from "react";
import ValueComponent from "../../../ValueComponent";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../../store/features/workflow/workflowSlice.ts";
import { handleInput } from "../../utils/handleInputs.ts";

type EmailInputPropTypes = {
  label: string;
  val: string;
  placeholder: string;
};

function EmailInputComponent({
  label,
  val: key,
  placeholder,
}: EmailInputPropTypes): ReactNode {
  const currentWorkflow = useSelector(currentWorkflowSelector);

  return (
    <div className="flex items-center gap-2">
      <p className="text-xs font-medium w-12 text-gray-500">{label}:</p>
      <ValueComponent
        valueOptions={[]}
        error={undefined}
        valueType={"STRING"}
        onValueChange={(val: string) => handleInput(key, val)}
        value={currentWorkflow?.[key]}
        placeHolder={placeholder}
        length={300}
      />
    </div>
  );
}

export default EmailInputComponent;
