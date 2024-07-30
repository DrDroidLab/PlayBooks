import { PayloadAction } from "@reduxjs/toolkit";
import { InitialStateType } from "../initialState";

export const setLastLogin = (
  state: InitialStateType,
  { payload }: PayloadAction<any>,
) => {
  state.lastLogin = payload;
};
