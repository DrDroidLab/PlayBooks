import React, { useRef, useEffect } from "react";
import CustomTimeRangeSection from "./CustomTimeRangeSection.tsx";
import TimeRangeOptionsSection from "./TimeRangeOptionsSection.tsx";
import { useDropdownContext } from "../../../contexts/DropdownContext.tsx";

function TimeSelectorDropDown() {
  const { registerRef } = useDropdownContext();
  const customTimeRangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (customTimeRangeRef.current) {
      registerRef(customTimeRangeRef);
    }
  }, [customTimeRangeRef, registerRef]);

  return (
    <div
      ref={customTimeRangeRef}
      className="absolute bottom-3 right-0 translate-y-full bg-white border rounded w-[500px] h-[250px] flex">
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
