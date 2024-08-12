import { KeyboardArrowDownRounded } from "@mui/icons-material";
import { ChangeEventHandler } from "react";
import CustomInput from "../../Inputs/CustomInput";
import { Tooltip } from "@mui/material";

type DropdownTitleProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  options?: any[];
  isOpen: boolean;
  toggle: () => void;
  error?: boolean;
  showIcon?: boolean;
  disabled?: boolean;
  inputDisabed?: boolean;
  onChange?: ChangeEventHandler;
  className?: string;
};

function DropdownTitle({
  placeholder,
  label,
  value,
  isOpen,
  toggle,
  error,
  showIcon = false,
  disabled = false,
  inputDisabed = false,
  onChange = () => {},
  className,
}: DropdownTitleProps) {
  return (
    <Tooltip title={disabled ? value : ""}>
      <div
        onClick={() => (disabled ? () => {} : toggle())}
        className={`${error ? "border-red-500" : ""} ${
          disabled ? "!bg-gray-100" : ""
        } flex items-center gap-2 justify-between w-full rounded border p-2 bg-white text-xs font-medium text-gray-700 focus:outline-none overflow-hidden cursor-pointer`}>
        <input
          className={`${className} ${
            disabled ? "bg-transparent" : ""
          } w-full h-full rounded outline-none max-w-full min-w-[200px] font-medium text-ellipsis disabled:bg-transparent`}
          type="text"
          placeholder={placeholder ?? `${label}`}
          value={value}
          disabled={inputDisabed}
          onChange={onChange}
        />
        {showIcon && !disabled && (
          <KeyboardArrowDownRounded
            fontSize="small"
            className={`${
              isOpen ? "rotate-180" : "rotate-0"
            } text-gray-600 !transition-all`}
          />
        )}
      </div>
    </Tooltip>
  );
}

export default DropdownTitle;
