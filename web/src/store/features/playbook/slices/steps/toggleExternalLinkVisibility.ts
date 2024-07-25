import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types/index.ts";

export const toggleExternalLinkVisibility = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  const { id } = payload;
  if (id) {
    const step = state.currentPlaybook?.steps?.find((step) => step.id === id);
    if (step)
      step.ui_requirement.showExternalLinks =
        !step.ui_requirement.showExternalLinks;
  }
};
