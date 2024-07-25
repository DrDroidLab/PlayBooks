import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../types/index.ts";

export const copyPlaybook = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  const { useState, pb, isTemplate } = payload;
  if (useState) {
    state.currentPlaybook!.name = "Copy of " + state.currentPlaybook!.name;
    state.currentPlaybook!.ui_requirement.isExisting = false;
    return;
  }
  state.currentPlaybook = pb;
  state.currentPlaybook!.ui_requirement.isExisting = false;
  if (!isTemplate) {
    state.currentPlaybook!.name = "Copy of " + pb.name;
  }
};
