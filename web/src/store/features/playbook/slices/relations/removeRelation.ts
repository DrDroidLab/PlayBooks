import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types/index.ts";

export const removeRelation = (
  state: PlaybookUIState,
  { payload }: PayloadAction<{ id: string }>,
) => {
  const { id } = payload;
  const relationIndex = state.currentPlaybook?.step_relations.findIndex(
    (e) => e.id === id,
  );

  if (relationIndex !== undefined && relationIndex !== -1) {
    state.currentPlaybook?.step_relations.splice(relationIndex, 1);
  }
};
