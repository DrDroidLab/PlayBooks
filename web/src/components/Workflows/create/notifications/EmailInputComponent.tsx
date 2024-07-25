import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../../store/features/workflow/workflowSlice.ts";
import { handleInput } from "../../utils/handleInputs.ts";
import CustomInput from "../../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../../types/inputs/inputTypes.ts";

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
      <CustomInput
        inputType={InputTypes.TEXT}
        label={label}
        value={currentWorkflow?.[key]}
        handleChange={(val: string) => handleInput(key, val)}
        placeholder={placeholder}
        className="!w-[300px]"
      />
    </div>
  );
}

export default EmailInputComponent;
