import { PayloadAction } from "@reduxjs/toolkit";
import { InitialStateType } from "../initialState";

export const setCommonKey = (
  state: InitialStateType,
  { payload }: PayloadAction<{ key: keyof InitialStateType; value: any }>,
) => {
  const { key, value } = payload;
  state[key] = value;
};
