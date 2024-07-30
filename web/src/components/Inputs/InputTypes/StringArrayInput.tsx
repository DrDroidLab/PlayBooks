import { HTMLInputTypeAttribute, useState } from "react";
import CustomInput from "../CustomInput";
import { InputTypes } from "../../../types";
import CustomButton from "../../common/CustomButton";
import { Add, Delete } from "@mui/icons-material";

type StringArrayInputTypes = {
  label?: string;
  value: string[];
  handleChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  type?: HTMLInputTypeAttribute;
} & React.InputHTMLAttributes<HTMLInputElement>;

function StringArrayInput({
  label,
  placeholder,
  disabled,
  ...props
}: StringArrayInputTypes) {
  const [values, setValues] = useState<string[]>(props.value ?? [""]);

  const handleAddClick = () => {
    setValues([...values, ""]);
  };

  const handleDelete = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    setValues(newValues);
    props.handleChange(JSON.stringify(newValues));
  };

  const handleValueChange = (val: string, index: number) => {
    const newValues = [...values];
    newValues[index] = val;
    setValues(newValues);
    props.handleChange(JSON.stringify(newValues));
  };

  return (
    <div className="flex flex-col gap-2">
      {values.map((value, index) => (
        <div className="flex flex-wrap gap-2">
          <CustomInput
            {...props}
            value={value}
            handleChange={(val: string) => handleValueChange(val, index)}
            inputType={InputTypes.TEXT}
            label={undefined}
            placeholder={placeholder ?? `Enter ${label}`}
            className="!w-[200px]"
          />
          {!disabled && index > 0 && (
            <CustomButton onClick={() => handleDelete(index)}>
              <Delete fontSize="small" />
            </CustomButton>
          )}
          {!disabled && index === values.length - 1 && (
            <CustomButton onClick={handleAddClick}>
              <Add fontSize="small" />
            </CustomButton>
          )}
        </div>
      ))}
    </div>
  );
}

export default StringArrayInput;
