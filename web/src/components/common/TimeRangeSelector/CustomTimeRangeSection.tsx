import React from "react";
import Picker, { PickerType } from "./Picker.tsx";
import CustomButton from "../CustomButton/index.tsx";
import { useDropdownContext } from "../../../contexts/DropdownContext.tsx";

function CustomTimeRangeSection() {
  const { toggle } = useDropdownContext();

  return (
    <div className="p-2 w-full">
      <p className="font-medium text-sm">Absolute Time Range</p>
      <div className="flex flex-col gap-3 my-3">
        <Picker label={"From"} type={PickerType.FROM} />
        <Picker label={"To"} type={PickerType.TO} />
      </div>
      <CustomButton onClick={toggle}>Apply Time Range</CustomButton>
    </div>
  );
}

export default CustomTimeRangeSection;
