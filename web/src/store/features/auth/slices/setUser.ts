import { PayloadAction } from "@reduxjs/toolkit";
import { InitialStateType } from "../initialState";

export const setUser = (
  state: InitialStateType,
  { payload }: PayloadAction<any>,
) => {
  state.user = payload;
};
