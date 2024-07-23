import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types";

export const deleteVariable = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  if (state.currentPlaybook!.global_variable_set[payload.name])
    delete state.currentPlaybook!.global_variable_set[payload.name];
};
