import React from "react";
import { DatePicker } from "rsuite";

export enum PickerType {
  FROM,
  TO,
}

function Picker({ type, label }) {
  return (
    <div>
      <p className="font-medium text-xs">{label}</p>
      <DatePicker
        format="dd MMM yyyy hh:mm:ss aa"
        showMeridian
        menuClassName="!z-[90]"
      />
    </div>
  );
}

export default Picker;
