import { InputTypes } from "../../../types";
import CustomInput from "../../Inputs/CustomInput";
import { useTypingDropdownMultipleContext } from "./contexts/TypingDropdownMultipleContext";

type FormPropTypes = {
  value: string;
  handleChange: (val: string) => void;
  handleSubmit: (val: string) => void;
  placeholder?: string;
};

function Form({
  value,
  handleChange,
  handleSubmit,
  placeholder,
  ...props
}: FormPropTypes) {
  const { toggle } = useTypingDropdownMultipleContext();

  return (
    <CustomInput
      {...props}
      onClick={toggle}
      value={value}
      handleChange={handleChange}
      onSubmit={() => handleSubmit(value)}
      inputType={InputTypes.TEXT}
      label={undefined}
      placeholder={placeholder}
      className="!w-full !h-full !outline-none !border-none !min-w-[200px] !m-0 !flex-1"
    />
  );
}

export default Form;
