import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types/index.ts";

export const addRule = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  const { id } = payload;
  const relation = state.currentPlaybook?.step_relations.find(
    (e) => e.id === id,
  );
  if (!relation) return;
  relation.condition?.rules.push({
    type: "",
    task: {
      reference_id: "",
      id: "",
    },
  });
};
