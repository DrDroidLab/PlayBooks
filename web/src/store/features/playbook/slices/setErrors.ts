import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../types/index.ts";

export const setErrors = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  const { id, errors } = payload;
  if (id) {
    const task = state.currentPlaybook!.ui_requirement.tasks?.find(
      (step) => step.id === id,
    );
    if (task) {
      task.ui_requirement.errors = errors;
    }
  }
};
