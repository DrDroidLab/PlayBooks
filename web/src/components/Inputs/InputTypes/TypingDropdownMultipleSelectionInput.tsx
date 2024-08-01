import { HTMLInputTypeAttribute, useState } from "react";
import CustomInput from "../CustomInput";
import { InputTypes } from "../../../types";
import Chip from "../../common/Chip";

type TypingDropdownMultipleSelectionInputTypes = {
  label?: string;
  value: string[];
  handleChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  options?: any[];
  type?: HTMLInputTypeAttribute;
  typingContainerClassname?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

function TypingDropdownMultipleSelectionInput({
  label,
  placeholder,
  disabled,
  options,
  ...props
}: TypingDropdownMultipleSelectionInputTypes) {
  const [value, setValue] = useState<string>("");
  const [values, setValues] = useState<string[]>(props.value ?? [""]);

  const handleDelete = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    setValues(newValues);
    props.handleChange(JSON.stringify(newValues));
  };

  const handleStringChange = (val: string) => {
    setValue(val);
  };

  const handleValueChange = (val: string) => {
    const newValues = [...values, val];
    setValues(newValues);
    props.handleChange(JSON.stringify(newValues));
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div
        className={`flex flex-wrap items-center gap-1 w-full p-1 rounded border border-lightgray bg-white text-sm focus:outline-none`}>
        {values?.map((item, index) => (
          <Chip
            key={item}
            item={item}
            handleClick={() => handleDelete(index)}
          />
        ))}

        <CustomInput
          {...props}
          value={value}
          handleChange={handleStringChange}
          onSubmit={() => handleValueChange(value)}
          inputType={InputTypes.TEXT}
          label={undefined}
          placeholder={placeholder ?? `Enter ${label}`}
          className="!w-full !h-full !outline-none !border-none !min-w-[200px] !m-0 !flex-1"
          containerClassName="flex-1"
        />
      </div>
    </div>
  );
}

export default TypingDropdownMultipleSelectionInput;
