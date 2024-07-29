import { PayloadAction } from "@reduxjs/toolkit";
import { InitialStateType } from "../initialState";

export const updateProperty = (
  state: InitialStateType,
  { payload }: PayloadAction<{ key: string; value: any }>,
) => {
  state[payload.key] = payload.value;
};
