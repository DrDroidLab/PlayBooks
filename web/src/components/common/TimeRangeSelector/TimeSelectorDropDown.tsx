import React from "react";
import CustomTimeRangeSection from "./CustomTimeRangeSection.tsx";
import TimeRangeOptionsSection from "./TimeRangeOptionsSection.tsx";

function TimeSelectorDropDown() {
  return (
    <div className="absolute -bottom-1 right-0 translate-y-full bg-gray-100 border rounded w-[500px] h-[250px] flex">
      <div className="flex-1 w-full">
        <CustomTimeRangeSection />
      </div>
      <div className="flex-[0.8] border-l w-full">
        <TimeRangeOptionsSection />
      </div>
    </div>
  );
}

export default TimeSelectorDropDown;
