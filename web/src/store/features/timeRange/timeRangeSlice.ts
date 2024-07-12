import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../index.ts";
import { timeRangeOptions } from "../../../components/common/TimeRangeSelector/utils/timeRangeOptions.ts";
import extractTime from "./utils/extractTime.ts";

const defaultRangeSelectionId = "now-30";

type InitialStateType = {
  timeRange: string;
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  time_lt?: string | Date;
  time_geq?: string | Date;
};

const initialState: InitialStateType = {
  timeRange:
    timeRangeOptions.find((o) => o.id === defaultRangeSelectionId)?.label ?? "",
  startTime: defaultRangeSelectionId,
  endTime: "now",
  time_lt: undefined,
  time_geq: undefined,
};

const timeRangeSlice = createSlice({
  name: "timeRange",
  initialState,
  reducers: {
    updateTimeRange: (state, { payload }) => {
      state.timeRange = payload;
    },
    updateCustomTillNowTimeRange: (state, { payload }) => {
      state.timeRange = "CustomTillNow";
      state.startTime = payload;
    },
    updateCustomTimeRange: (state, { payload }) => {
      state.timeRange = payload.value;
      state.startTime = payload.startTime;
      state.endTime = payload.endTime;
    },
    updateProperty: (state, { payload }) => {
      state[payload.key] = payload.value;
    },
    setPlaybookState: (state) => {
      // state.timeRange = "CustomTillNow";
      // state.endTime = Date.now() / 1000;
      // state.startTime = (Date.now() - 1 * 60 * 60 * 1000) / 1000;
    },
    resetTimeRange: (state) => {
      state.timeRange = initialState.timeRange;
      state.startTime = initialState.startTime;
      state.endTime = initialState.endTime;
    },
  },
});

export const {
  updateTimeRange,
  updateCustomTimeRange,
  updateProperty,
  updateCustomTillNowTimeRange,
  setPlaybookState,
  resetTimeRange,
} = timeRangeSlice.actions;

export default timeRangeSlice.reducer;

export const timeRangeSelector = (state: RootState) => state.timeRange;
export const rangeSelector = (state: RootState) => {
  const { startTime, endTime } = state.timeRange;
  return {
    time_geq: extractTime(startTime),
    time_lt: extractTime(endTime),
  };
};
