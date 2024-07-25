import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../types/index.ts";

export const setCurrentPlaybookKey = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  if (state.currentPlaybook) state.currentPlaybook[payload.key] = payload.value;
};
