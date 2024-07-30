import { PayloadAction } from "@reduxjs/toolkit";
import { InitialStateType, PermanentDrawerTypesKeys } from "../initialState";

export const openDrawer = (
  state: InitialStateType,
  { payload }: PayloadAction<PermanentDrawerTypesKeys>,
) => {
  state[payload] = true;
};
