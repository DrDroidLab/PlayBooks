import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types/index.ts";

export const setCurrentVisibleStep = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  state.currentVisibleTask = undefined;
  state.currentVisibleStep = payload;
};
