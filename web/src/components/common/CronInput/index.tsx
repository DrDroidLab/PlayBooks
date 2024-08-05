import { useState } from "react";
import { InputTypes } from "../../../types";
import CustomInput from "../../Inputs/CustomInput";
import CronOverlay from "./CronOverlay";
import { AccessTimeRounded } from "@mui/icons-material";

type CronInputTypes = {
  label?: string;
  value: string;
  handleChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

function CronInput(props: CronInputTypes) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpenOverlay = () => {
    setIsOpen(true);
  };

  return (
    <div>
      <div className="cursor-pointer" onClick={handleOpenOverlay}>
        <CustomInput
          {...props}
          inputType={InputTypes.TEXT}
          className="border-none !p-0 cursor-pointer disabled:!bg-transparent"
          disabled={true}
          containerClassName="border p-2 rounded"
          suffix={
            <div className="text-gray-400 flex items-center">
              <AccessTimeRounded fontSize="small" />
            </div>
          }
        />
      </div>

      {isOpen && (
        <CronOverlay
          isOpen={isOpen}
          close={handleClose}
          value={props.value}
          setValue={props.handleChange}
        />
      )}
    </div>
  );
}

export default CronInput;
