import React, { HTMLInputTypeAttribute } from "react";
import CustomInput from "../CustomInput";
import { InputTypes } from "../../../types";
import CustomButton from "../../common/CustomButton";

type TextButtonInputTypes = {
  label?: string;
  value: string;
  handleChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  type?: HTMLInputTypeAttribute;
  buttonText: string;
  buttonClickValue: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

function TextButton({
  buttonText,
  buttonClickValue,
  ...props
}: TextButtonInputTypes) {
  const handleClick = () => {
    props.handleChange(buttonClickValue);
  };

  const isButtonText = buttonClickValue === props.value;
  const buttonClassName = isButtonText ? "!bg-violet-500 !text-white" : "";

  return (
    <div className="flex flex-wrap">
      <CustomInput
        {...props}
        label=""
        inputType={InputTypes.TEXT}
        className={`${
          isButtonText ? "bg-gray-50" : ""
        } min-w-[200px] rounded-r-none`}
      />
      <CustomButton
        onClick={handleClick}
        className={`${buttonClassName} rounded-l-none`}>
        {buttonText}
      </CustomButton>
    </div>
  );
}

export default TextButton;
