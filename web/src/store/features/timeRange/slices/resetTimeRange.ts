import { PayloadAction } from "@reduxjs/toolkit";
import { initialState, InitialStateType } from "../initialState";

export const resetTimeRange = (state: InitialStateType) => {
  state.timeRange = initialState.timeRange;
  state.startTime = initialState.startTime;
  state.endTime = initialState.endTime;
};
