import { PayloadAction } from "@reduxjs/toolkit";
import { InitialStateType, DrawerTypesKeys } from "../initialState";

export const openDrawer = (
  state: InitialStateType,
  { payload }: PayloadAction<DrawerTypesKeys>,
) => {
  state[payload] = true;
};
