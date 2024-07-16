import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { DatePicker } from "rsuite";
import {
  timeRangeSelector,
  updateProperty,
} from "../../../store/features/timeRange/timeRangeSlice.ts";
import CustomButton from "../CustomButton/index.tsx";
import { isAfter, isBefore } from "rsuite/esm/internals/utils/date/index";

const nowKey = "now";

export enum PickerType {
  FROM,
  TO,
}

function Picker({ type, label }) {
  const dispatch = useDispatch();
  const timeRange = useSelector(timeRangeSelector);
  let key: string = "time_geq";
  let disabledDate = (date: Date) => isAfter(date, new Date());

  switch (type) {
    case PickerType.FROM:
      key = "startTime";
      if (timeRange.endTime && typeof timeRange.endTime === "object") {
        disabledDate = (date: Date) =>
          isAfter(date, new Date(timeRange.endTime as Date));
      }
      break;
    case PickerType.TO:
      key = "endTime";
      console.log("start", typeof timeRange.startTime);
      if (timeRange.startTime && typeof timeRange.startTime === "object") {
        disabledDate = (date: Date) =>
          isAfter(date, new Date()) ||
          isBefore(date, new Date(timeRange.startTime as Date));
      }
      break;
    default:
      break;
  }

  const setTime = (value: Date | null) => {
    dispatch(updateProperty({ key: "timeRange", value: undefined }));
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
          format="dd/MM/yyyy hh:mm:ss aa"
          placeholder=""
          onChangeCalendarDate={setTime}
          showMeridian
          shouldDisableDate={disabledDate}
          value={typeof timeRange[key] === "string" ? null : timeRange[key]}
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
