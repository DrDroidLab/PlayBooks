import { PayloadAction } from "@reduxjs/toolkit";
import { InitialStateType } from "../initialState";

export const updateCustomTimeRange = (
  state: InitialStateType,
  { payload }: PayloadAction<{ startTime: string; endTime: any }>,
) => {
  state.startTime = payload.startTime;
  state.endTime = payload.endTime;
};
