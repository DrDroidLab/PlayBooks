import { PayloadAction } from "@reduxjs/toolkit";
import { DrawerTypesKeys, InitialStateType } from "../initialState";

export const closeDrawer = (
  state: InitialStateType,
  { payload }: PayloadAction<{ id: DrawerTypesKeys; resetState: boolean }>,
) => {
  const { id, resetState } = payload;
  state[id] = false;
  if (resetState) state.additionalState = {};
};
