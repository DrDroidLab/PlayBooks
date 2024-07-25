import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../types/index.ts";

export const setMeta = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  state.meta = payload;
};
