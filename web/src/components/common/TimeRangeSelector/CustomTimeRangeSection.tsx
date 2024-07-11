import React from "react";
import { DatePicker } from "rsuite";

function CustomTimeRangeSection() {
  return (
    <div className="p-1">
      <p className="font-medium text-sm">Absolute Time Range</p>
      <DatePicker
        format="dd MMM yyyy hh:mm:ss aa"
        showMeridian
        className="z-[1000]"
        style={{ width: 220 }}
      />
    </div>
  );
}

export default CustomTimeRangeSection;
