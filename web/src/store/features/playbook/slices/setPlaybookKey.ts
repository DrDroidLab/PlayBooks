import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../types/index.ts";

export const setPlaybookKey = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  state[payload.key] = payload.value;
};
