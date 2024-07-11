import { KeyboardArrowDownRounded, ScheduleRounded } from "@mui/icons-material";
import React from "react";
import useDropdown from "../../../hooks/useDropdown.ts";
import TimeSelectorDropDown from "./TimeSelectorDropDown.tsx";

function TimeRangeSelector() {
  const { dropdownRef, isOpen, toggle } = useDropdown();

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={toggle}
        className={`${
          isOpen ? "bg-gray-100" : ""
        } border w-fit p-1 flex items-center gap-2 rounded hover:bg-gray-100 cursor-pointer transition-all`}>
        <ScheduleRounded fontSize="small" />
        <span className="text-xs font-medium">
          2024-07-11 07:21:03 to 2024-07-11 15:56:28
        </span>
        <KeyboardArrowDownRounded fontSize="small" />
      </div>
      {isOpen && <TimeSelectorDropDown />}
    </div>
  );
}

export default TimeRangeSelector;
