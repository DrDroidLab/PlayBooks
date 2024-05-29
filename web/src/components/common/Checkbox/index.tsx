import React from "react";

interface CheckboxProps {
  id: string;
  label: string;
  help?: string;
  isChecked: boolean;
  onChange: (id: string) => void;
  disabled: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  help,
  isChecked,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={isChecked}
            onChange={() => onChange(id)}
            disabled={disabled}
          />
          <div
            className={`w-5 h-5 inline-block mr-2 rounded border transition duration-300 ease-in-out ${
              isChecked ? "bg-violet-500 border-violet-500" : "border-gray-300"
            }`}>
            {isChecked && (
              <svg
                className="text-white w-full h-full transition-transform transform-gpu duration-300 ease-in-out"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <span className="text-gray-700 transition duration-300 ease-in-out">
            {label}
          </span>
        </label>
      </div>
      {help && <span className="text-sm text-[#ADADAD]">{help}</span>}
    </div>
  );
};

export default Checkbox;
