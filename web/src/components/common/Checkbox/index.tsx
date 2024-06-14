import { InfoRounded } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import React from "react";

interface CheckboxProps {
  id: string;
  label: string;
  help?: string;
  isChecked: boolean;
  isSmall?: boolean;
  info?: string;
  onChange: (id: string) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  help,
  isChecked,
  onChange,
  isSmall = false,
  info,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <label
          className={`inline-flex items-center cursor-pointer ${
            isSmall ? "gap-1" : "gap-2"
          } `}>
          <input
            type="checkbox"
            className="sr-only"
            checked={isChecked}
            onChange={() => onChange(id)}
          />
          <div
            className={`${
              isSmall ? "w-4 h-4" : "w-5 h-5"
            } inline-block rounded border transition duration-300 ease-in-out ${
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
          <span
            className={`${
              isSmall ? "text-sm" : "text-base"
            } text-gray-700 transition duration-300 ease-in-out`}>
            {label}
          </span>
          {info && (
            <Tooltip title={info}>
              <InfoRounded color="primary" />
            </Tooltip>
          )}
        </label>
      </div>
      {help && <span className="text-sm text-[#ADADAD]">{help}</span>}
    </div>
  );
};

export default Checkbox;
