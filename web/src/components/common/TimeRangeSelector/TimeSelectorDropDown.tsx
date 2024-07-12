import React from "react";
import CustomTimeRangeSection from "./CustomTimeRangeSection.tsx";
import TimeRangeOptionsSection from "./TimeRangeOptionsSection.tsx";

function TimeSelectorDropDown({ toggle }) {
  return (
    <div className="absolute -bottom-3 right-0 translate-y-full bg-white border rounded w-[500px] h-[250px] flex">
      <div className="flex-1 w-full">
        <CustomTimeRangeSection toggle={toggle} />
      </div>
      <div className="flex-[0.8] border-l w-full">
        <TimeRangeOptionsSection />
      </div>
    </div>
  );
}

export default TimeSelectorDropDown;
