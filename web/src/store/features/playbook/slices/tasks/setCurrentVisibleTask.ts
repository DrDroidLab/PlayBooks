import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types";

export const setCurrentVisibleTask = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  state.currentVisibleStep = undefined;
  state.currentVisibleTask = payload;
};
