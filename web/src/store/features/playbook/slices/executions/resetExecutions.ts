import { PlaybookUIState } from "../../../../../types/index.ts";

export const resetExecutions = (state: PlaybookUIState) => {
  state.executionId = undefined;
};
