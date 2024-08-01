import { FormEvent } from "react";
import { InputTypes } from "../../../types";
import CustomInput from "../../Inputs/CustomInput";
import { useTypingDropdownMultipleContext } from "./contexts/TypingDropdownMultipleContext";

type FormPropTypes = {
  placeholder?: string;
};

function Form({ placeholder, ...props }: FormPropTypes) {
  const { toggle, handleValueChange, handleStringChange, value } =
    useTypingDropdownMultipleContext();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleValueChange(value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CustomInput
        {...props}
        onClick={toggle}
        value={value}
        handleChange={handleStringChange}
        inputType={InputTypes.TEXT}
        label={undefined}
        placeholder={placeholder}
        className="!w-full !h-full !outline-none !border-none !min-w-[200px] !m-0 !flex-1"
      />
    </form>
  );
}

export default Form;
