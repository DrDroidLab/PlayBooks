import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types";

export const addGlobalVariable = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  state.currentPlaybook!.global_variable_set[payload.name] = payload.value;
};
