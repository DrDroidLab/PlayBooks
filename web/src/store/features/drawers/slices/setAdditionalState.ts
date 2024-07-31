import { PayloadAction } from "@reduxjs/toolkit";
import { InitialStateType } from "../initialState";

export const setAdditionalState = (
  state: InitialStateType,
  { payload }: PayloadAction<Record<string, any>>,
) => {
  state.additionalState = payload;
};
