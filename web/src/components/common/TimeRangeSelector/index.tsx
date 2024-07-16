import React from "react";
import RangeSelector from "./RangeSelector.tsx";
import { DropdownProvider } from "../../../contexts/DropdownContext.tsx";

function TimeRangeSelector() {
  return (
    <DropdownProvider>
      <RangeSelector />
    </DropdownProvider>
  );
}

export default TimeRangeSelector;
