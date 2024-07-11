import React from "react";
import BasicSearch from "../BasicSearch/index.tsx";
import useBasicSearch from "../../../hooks/useBasicSearch.ts";
import { timeRangeOptions } from "./utils/timeRangeOptions.ts";

function TimeRangeOptionsSection() {
  const { query, setValue, filteredList } = useBasicSearch(timeRangeOptions, [
    "label",
  ]);

  return (
    <div className="h-full overflow-auto">
      <div className="p-1 sticky top-0">
        <BasicSearch
          query={query}
          setValue={setValue}
          placeholder="Search Quick Ranges"
          inputClassName="text-xs"
        />
      </div>
      <div className="overflow-scroll">
        {filteredList.map((timeRange) => (
          <div
            className="hover:bg-gray-200 cursor-pointer w-full p-1"
            key={timeRange.id}>
            <span className="text-sm text-left">{timeRange.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TimeRangeOptionsSection;
