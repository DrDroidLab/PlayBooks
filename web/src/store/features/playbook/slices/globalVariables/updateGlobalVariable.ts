import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types";

export const updateGlobalVariable = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  state.currentPlaybook!.global_variable_set[payload.name] = payload.value;
};
