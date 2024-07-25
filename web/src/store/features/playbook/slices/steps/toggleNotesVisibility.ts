import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types/index.ts";

export const toggleNotesVisibility = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  const { id } = payload;
  if (id) {
    const step = state.currentPlaybook?.steps?.find((step) => step.id === id);
    if (step) step.ui_requirement.showNotes = !step.ui_requirement.showNotes;
  }
};
