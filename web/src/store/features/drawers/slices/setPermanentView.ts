import { PayloadAction } from "@reduxjs/toolkit";
import { InitialStateType, PermanentDrawerTypesKeys } from "../initialState";

export const setPermanentView = (
  state: InitialStateType,
  { payload }: PayloadAction<PermanentDrawerTypesKeys>,
) => {
  state.permanentView = payload;
};
