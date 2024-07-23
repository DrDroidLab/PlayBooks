import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types/index.ts";

export const addExternalLinks = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  const { id, links } = payload;
  if (id) {
    const step = state.currentPlaybook!.steps?.find((step) => step.id === id);
    if (step) {
      step.external_links = links;
    }
  }
};
