import { KeyboardArrowDownRounded, ScheduleRounded } from "@mui/icons-material";
import React from "react";
import useDropdown from "../../../hooks/useDropdown.ts";
import TimeSelectorDropDown from "./TimeSelectorDropDown.tsx";
import { useSelector } from "react-redux";
import { timeRangeSelector } from "../../../store/features/timeRange/timeRangeSlice.ts";

function TimeRangeSelector() {
  const { dropdownRef, isOpen, toggle } = useDropdown();
  const { startTime, endTime } = useSelector(timeRangeSelector);
  const startTimeRender = startTime
    ? typeof startTime === "string"
      ? startTime
      : `${startTime?.toLocaleDateString()} ${startTime?.toLocaleTimeString()}`
    : "";

  const endTimeRender = endTime
    ? typeof endTime === "string"
      ? endTime
      : `${endTime?.toLocaleDateString()} ${endTime?.toLocaleTimeString()}`
    : "";

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={toggle}
        className={`${
          isOpen ? "bg-gray-100" : ""
        } border w-fit p-1 flex items-center gap-2 rounded hover:bg-gray-100 cursor-pointer transition-all`}>
        <ScheduleRounded fontSize="small" />
        <span className="text-xs font-medium">
          {startTimeRender} to {endTimeRender}
        </span>
        <KeyboardArrowDownRounded fontSize="small" />
      </div>
      {isOpen && <TimeSelectorDropDown />}
    </div>
  );
}

export default TimeRangeSelector;
