import { PayloadAction } from "@reduxjs/toolkit";
import { InitialStateType } from "../initialState";

export const setProviders = (
  state: InitialStateType,
  { payload }: PayloadAction<any>,
) => {
  state.providers = payload;
};
