import { PlaybookUIState } from "../../../../../types/index.ts";

export const popFromExecutionStack = (state: PlaybookUIState) => {
  if (state.executionStack.length > 0) state.executionStack.pop();
};
