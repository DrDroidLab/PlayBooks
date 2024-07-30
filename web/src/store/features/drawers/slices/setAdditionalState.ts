import { PayloadAction } from "@reduxjs/toolkit";
import { InitialStateType, PermanentDrawerTypesKeys } from "../initialState";

export const setAdditionalState = (
  state: InitialStateType,
  { payload }: PayloadAction<Record<string, any>>,
) => {
  state.additionalState = payload;
};
