import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types/index.ts";
import { PermanentDrawerTypes } from "../../../drawers/permanentDrawerTypes.ts";

export const deleteTask = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  const id = payload;
  if (id) {
    const task = state.currentPlaybook!.ui_requirement.tasks?.find(
      (task) => task.id === id,
    );
    const taskIndex = state.currentPlaybook!.ui_requirement.tasks.findIndex(
      (task) => task.id === id,
    );
    if (task) {
      const stepId = task.ui_requirement.stepId;
      const step = state.currentPlaybook!.steps.find(
        (step) => step.id === stepId,
      );
      const taskIndexInStep = step?.tasks.findIndex(
        (e) => (e as string) === id,
      );
      if (
        taskIndexInStep !== undefined &&
        taskIndexInStep !== null &&
        taskIndexInStep !== -1
      )
        step?.tasks.splice(taskIndexInStep, 1);
      state.currentPlaybook!.ui_requirement.tasks.splice(taskIndex, 1);
    }
    state.permanentView = PermanentDrawerTypes.DEFAULT;
  }
};
