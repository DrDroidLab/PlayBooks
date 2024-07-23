import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../types/index.ts";

export const setPlaybookData = (
  state: PlaybookUIState,
  action: PayloadAction<any>,
) => {
  state.currentPlaybook = action.payload;
};
