import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types";

export const showTaskConfig = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  state.currentVisibleTask = payload.toString();
  const task = state.currentPlaybook!.ui_requirement.tasks.find(
    (task) => task.id === state.currentVisibleTask,
  );
  if (task) task.ui_requirement.isOpen = true;
};
