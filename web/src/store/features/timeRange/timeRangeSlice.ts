import { createSlice } from "@reduxjs/toolkit";
import {
  defaultTimeRangeOptions,
  playbooksTimeRangeOptions,
} from "../../../utils/timeRangeOptions.ts";
import { RootState } from "../../index.ts";

type InitialStateType = {
  timeRange: string;
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  time_lt?: string | Date;
  time_geq?: string | Date;
  options: OptionType;
};

enum OptionType {
  default = "default",
  playbooks = "playbooks",
}

const initialState: InitialStateType = {
  timeRange: "2 weeks",
  startTime: null,
  endTime: null,
  options: OptionType.default,
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
      state.timeRange = "CustomTillNow";
      // state.endTime = Date.now() / 1000;
      // state.startTime = (Date.now() - 1 * 60 * 60 * 1000) / 1000;
      state.options = OptionType.playbooks;
    },
    resetTimeRange: (state) => {
      state.timeRange = "2 weeks";
      state.startTime = null;
      state.endTime = null;
      state.options = OptionType.default;
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
export const rangeSelector = (state) => {
  const timeRange = state.timeRange;
  switch (timeRange.timeRange) {
    case "Custom":
      return {
        time_geq: Math.round(timeRange.startTime),
        time_lt: Math.round(timeRange.endTime),
      };
    case "CustomTillNow":
      return {
        time_geq: Math.round(timeRange.startTime),
        time_lt: Math.round(Date.now() / 1000),
      };
    default:
      switch (state.options) {
        case OptionType.default:
          return defaultTimeRangeOptions[
            timeRange.timeRange.replaceAll(/\s/g, "")
          ]?.getTimeRange();
        case OptionType.playbooks:
          return playbooksTimeRangeOptions[
            timeRange.timeRange.replaceAll(/\s/g, "")
          ]?.getTimeRange();
        default:
          return defaultTimeRangeOptions[
            timeRange.timeRange.replaceAll(/\s/g, "")
          ]?.getTimeRange();
      }
  }
};
