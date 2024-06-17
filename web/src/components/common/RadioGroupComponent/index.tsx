import React from "react";
import RadioComponent from "../RadioComponent/index.tsx"; // Adjust the path as needed
import { randomString } from "../../../utils/utils.js";

interface RadioGroupProps {
  label?: string;
  options: {
    label: string;
    name?: string;
    disabled?: boolean;
    value?: string;
    help?: string;
    info?: string;
    isSmall?: boolean;
  }[];
  onChange: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  checked: string;
  groupName?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  options,
  onChange,
  orientation = "horizontal",
  checked,
  groupName = randomString(),
}) => {
  const renderOptions = () => {
    return options.map(({ label, isSmall, value = label, help, info }) => {
      const checkedValue = checked === value;
      const shortenedOptionLabel = label.replace(/\s+/g, "");
      const optionId = `radio-option-${shortenedOptionLabel}`;
      return (
        <RadioComponent
          id={`${optionId}-${groupName}`}
          label={label}
          key={optionId}
          isChecked={checkedValue}
          onChange={() => onChange(value)}
          isSmall={isSmall ?? false}
          help={help}
          info={info}
        />
      );
    });
  };

  return (
    <div className="flex flex-col">
      {label && <div className="mb-2 text-base font-semibold">{label}</div>}
      <div
        className={`flex ${
          orientation === "horizontal"
            ? "flex-row space-x-4"
            : "flex-col space-y-[2px]"
        }`}>
        {renderOptions()}
      </div>
    </div>
  );
};

export default RadioGroup;
