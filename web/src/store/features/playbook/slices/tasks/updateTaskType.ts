import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types";

export const updateTaskType = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  const id = payload.id;
  let task = state.currentPlaybook!.ui_requirement.tasks.find(
    (e) => e.id === id,
  );
  if (task) {
    const type: string = task[task?.source?.toLowerCase()].type;
    delete task[task?.source?.toLowerCase()][type?.toLowerCase()];
    task[task?.source?.toLowerCase()].type = payload.value;
    task[task?.source?.toLowerCase()][payload.value?.toLowerCase()] = {};
  }
};
