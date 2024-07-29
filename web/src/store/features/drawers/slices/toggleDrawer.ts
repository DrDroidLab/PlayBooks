import { PayloadAction } from "@reduxjs/toolkit";
import { InitialStateType, PermanentDrawerTypesKeys } from "../initialState";

export const toggleDrawer = (
  state: InitialStateType,
  { payload }: PayloadAction<PermanentDrawerTypesKeys>,
) => {
  if (!state[payload]) state.additionalState = {};
  state[payload] = !state[payload];
};
