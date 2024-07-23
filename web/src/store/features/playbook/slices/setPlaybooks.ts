import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../types/index.ts";

export const setPlaybooks = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  if (Object.keys(state.meta ?? {}).length > 0) {
    state.playbooks.push(...payload);
  } else {
    state.playbooks = [...payload];
  }
};
