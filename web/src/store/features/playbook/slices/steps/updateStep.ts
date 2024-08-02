import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types/index.ts";
import setNestedValue from "../../../../../utils/common/setNestedValue.ts";

export const updateStep = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  const { id, key, value } = payload;
  if (!state.currentPlaybook) return;
  if (!state.currentPlaybook.steps || state.currentPlaybook.steps?.length === 0)
    return;
  let step = state.currentPlaybook.steps.find((e) => e.id === id);
  if (step) {
    step = setNestedValue(step, key, value);
  }
};
