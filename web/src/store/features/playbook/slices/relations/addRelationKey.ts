import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types/index.ts";
import setNestedValue from "../../../../../utils/common/setNestedValue.ts";

export const addRelationKey = (
  state: PlaybookUIState,
  { payload }: PayloadAction<{ id: string; key: string; value: any }>,
) => {
  const { id, key, value } = payload;
  let relation = state.currentPlaybook?.step_relations.find((e) => e.id === id);
  relation = setNestedValue(relation, key, value);
};
