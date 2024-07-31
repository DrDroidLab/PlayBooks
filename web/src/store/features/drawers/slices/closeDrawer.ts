import { PayloadAction } from "@reduxjs/toolkit";
import { InitialStateType, PermanentDrawerTypesKeys } from "../initialState";

export const closeDrawer = (
  state: InitialStateType,
  {
    payload,
  }: PayloadAction<{ id: PermanentDrawerTypesKeys; resetState: boolean }>,
) => {
  const { id, resetState } = payload;
  state[id] = false;
  if (resetState) state.additionalState = {};
};
