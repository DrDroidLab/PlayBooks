import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types/index.ts";
import { PermanentDrawerTypes } from "../../../drawers/permanentDrawerTypes.ts";

export const deleteStep = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  const id = payload;
  if (id) {
    const step = state.currentPlaybook!.steps.find((step) => step.id === id);
    const stepIndex = state.currentPlaybook!.steps.findIndex(
      (step) => step.id === id,
    );
    if (step) {
      const taskIds = step.tasks.map((task) =>
        typeof task === "string" ? task : task.id,
      );
      state.currentPlaybook!.steps.splice(stepIndex, 1);
      taskIds.forEach((taskId) => {
        const tasks = state.currentPlaybook!.ui_requirement.tasks;
        const taskIndex = tasks.findIndex((e) => e.id === taskId);
        tasks.splice(taskIndex, 1);
      });
      state.currentPlaybook!.step_relations =
        state.currentPlaybook!.step_relations.filter((relation) => {
          if (typeof relation.parent === "string") {
            return (
              relation.parent !== id &&
              relation.child?.reference_id !== step?.reference_id
            );
          }
          return (
            relation.parent.reference_id !== step?.reference_id &&
            relation.child?.reference_id !== step.reference_id
          );
        });
    }
    state.permanentView = PermanentDrawerTypes.DEFAULT;
  }
};
