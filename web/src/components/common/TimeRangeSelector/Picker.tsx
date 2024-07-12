import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { DatePicker } from "rsuite";
import {
  timeRangeSelector,
  updateProperty,
} from "../../../store/features/timeRange/timeRangeSlice.ts";
import CustomButton from "../CustomButton/index.tsx";

const nowKey = "now";

export enum PickerType {
  FROM,
  TO,
}

function Picker({ type, label }) {
  const dispatch = useDispatch();
  const timeRange = useSelector(timeRangeSelector);
  let key: string = "time_geq";

  switch (type) {
    case PickerType.FROM:
      key = "startTime";
      break;
    case PickerType.TO:
      key = "endTime";
      break;
    default:
      break;
  }

  const setTime = (value: Date | null) => {
    dispatch(updateProperty({ key, value }));
  };

  const setNow = () => {
    dispatch(updateProperty({ key, value: nowKey }));
  };

  return (
    <div>
      <p className="font-medium text-xs">{label}</p>
      <div className="flex">
        <DatePicker
          format="dd MMM yyyy hh:mm:ss aa"
          showMeridian
          onChange={setTime}
          value={timeRange[key] === nowKey ? null : timeRange[key]}
          className="!text-violet-500 !w-full"
          menuClassName="!z-[90] text-violet-500 bg-violet-500"
        />
        {type === PickerType.TO && (
          <CustomButton
            className={`${
              timeRange[key] === nowKey ? "!bg-violet-500 !text-white" : ""
            }`}
            onClick={setNow}>
            Now
          </CustomButton>
        )}
      </div>
    </div>
  );
}

export default Picker;
