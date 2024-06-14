import { InfoRounded } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import React from "react";

interface RadioComponentProps {
  id: string;
  label: string;
  help?: string;
  isChecked: boolean;
  isSmall?: boolean;
  info?: string;
  onChange: (id: string) => void;
}

const RadioComponent: React.FC<RadioComponentProps> = ({
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
            type="radio"
            className="sr-only"
            checked={isChecked}
            onChange={() => onChange(id)}
          />
          <div
            className={`${
              isSmall ? "w-4 h-4" : "w-5 h-5"
            } inline-block rounded-full border transition duration-300 ease-in-out ${
              isChecked ? "bg-violet-500 border-violet-500" : "border-gray-300"
            }`}>
            {isChecked && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="bg-white rounded-full w-2 h-2 transition-transform transform-gpu duration-300 ease-in-out" />
              </div>
            )}
          </div>
          <span
            className={`${
              isSmall ? "text-xs" : "text-base"
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

export default RadioComponent;
