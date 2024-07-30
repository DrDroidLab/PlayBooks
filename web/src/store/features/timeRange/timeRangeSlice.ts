import { createSlice } from "@reduxjs/toolkit";
import { initialState } from "./initialState.ts";
import * as Actions from "./slices";
export * from "./selectors";

const timeRangeSlice = createSlice({
  name: "timeRange",
  initialState: initialState,
  reducers: {
    updateCustomTimeRange: Actions.updateCustomTimeRange,
    updateProperty: Actions.updateProperty,
    resetTimeRange: Actions.resetTimeRange,
  },
});

export const { updateCustomTimeRange, updateProperty, resetTimeRange } =
  timeRangeSlice.actions;

export default timeRangeSlice.reducer;
