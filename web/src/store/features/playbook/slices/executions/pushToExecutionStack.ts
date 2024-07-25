import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types/index.ts";

export const pushToExecutionStack = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  const nextPossibleSteps = payload;

  (nextPossibleSteps ?? []).forEach((stepId: string) => {
    if (!state.executionStack.includes(stepId)) {
      state.executionStack.push(stepId);
    }
  });
};
