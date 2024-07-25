import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types/index.ts";

export const addNotes = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  const { id, notes } = payload;
  if (id) {
    const step = state.currentPlaybook?.steps?.find((step) => step.id === id);
    if (step) {
      step.notes = notes;
    }
  }
};
