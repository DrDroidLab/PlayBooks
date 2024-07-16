import { KeyboardArrowDownRounded, ScheduleRounded } from "@mui/icons-material";
import React, { useEffect } from "react";
import TimeSelectorDropDown from "./TimeSelectorDropDown.tsx";
import { useSelector } from "react-redux";
import { timeRangeSelector } from "../../../store/features/timeRange/timeRangeSlice.ts";
import { useDropdownContext } from "../../../contexts/DropdownContext.tsx";

function RangeSelector() {
  const { dropdownRef, isOpen, toggle, registerRef } = useDropdownContext();
  const { startTime, endTime, timeRange } = useSelector(timeRangeSelector);

  useEffect(() => {
    if (dropdownRef.current) {
      registerRef(dropdownRef);
    }
  }, [dropdownRef, registerRef]);

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
    <>
      <div
        ref={dropdownRef}
        onClick={toggle}
        className={`${
          isOpen ? "bg-gray-100" : ""
        } border w-fit p-1 flex items-center gap-2 rounded hover:bg-gray-100 cursor-pointer transition-all`}>
        <ScheduleRounded fontSize="small" />
        <span className="text-xs font-medium">
          {timeRange ?? `${startTimeRender} to ${endTimeRender}`}
        </span>
        <KeyboardArrowDownRounded fontSize="small" />
      </div>
      {isOpen && <TimeSelectorDropDown />}
    </>
  );
}

export default RangeSelector;
