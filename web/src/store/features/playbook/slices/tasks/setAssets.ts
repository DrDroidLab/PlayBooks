import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types/index.ts";

export const setAssets = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  const { id } = payload;
  if (id) {
    const task = state.currentPlaybook!.ui_requirement.tasks?.find(
      (task) => task.id === id,
    );
    if (task) task.ui_requirement.assets = payload.assets;
  }
};
