import React from "react";
// import BasicSearch from "../BasicSearch/index.tsx";
// import useBasicSearch from "../../../hooks/useBasicSearch.ts";
import { timeRangeOptions } from "./utils/timeRangeOptions.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  timeRangeSelector,
  updateProperty,
} from "../../../store/features/timeRange/timeRangeSlice.ts";

function TimeRangeOptionsSection() {
  const dispatch = useDispatch();
  const { startTime } = useSelector(timeRangeSelector);
  console.log("time", startTime);
  // const { query, setValue, filteredList } = useBasicSearch(timeRangeOptions, [
  //   "label",
  // ]);

  const setTime = (id: string) => {
    dispatch(
      updateProperty({
        key: "timeRange",
        value: timeRangeOptions.find((o) => o.id === id)?.label,
      }),
    );
    dispatch(updateProperty({ key: "startTime", value: id }));
    dispatch(updateProperty({ key: "endTime", value: "now" }));
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-1 sticky top-0">
        {/* <BasicSearch
          query={query}
          setValue={setValue}
          placeholder="Search Quick Ranges"
          inputClassName="text-xs"
        /> */}
      </div>
      <div className="overflow-scroll">
        {timeRangeOptions.map((timeRange) => (
          <div
            className={`${
              timeRange.id === startTime ? "bg-gray-100" : "bg-transparent"
            } hover:bg-gray-200 cursor-pointer w-full p-1`}
            key={timeRange.id}
            onClick={() => setTime(timeRange.id)}>
            <span className="text-sm text-left">{timeRange.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TimeRangeOptionsSection;
