import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types/index.ts";
import setNestedValue from "../../../../../utils/common/setNestedValue.ts";

export const updateTask = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  const id = payload.id;
  let task = state.currentPlaybook!.ui_requirement.tasks.find(
    (e) => e.id === id,
  );
  if (task) {
    task = setNestedValue(task, payload.key, payload.value);
  }
};
