import { RootState } from "../../..";
import { extractTime } from "../utils";

export const rangeSelector = (state: RootState) => {
  const { startTime, endTime } = state.timeRange;
  return {
    time_geq: extractTime(startTime),
    time_lt: extractTime(endTime),
  };
};
