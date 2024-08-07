import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState, Step, Task } from "../../../../../types/index.ts";
import generateUUIDWithoutHyphens from "../../../../../utils/common/generateUUIDWithoutHyphens.ts";
import { v4 as uuidv4 } from "uuid";
import { playbookSlice } from "../../playbookSlice.ts";

export const duplicateStep = (
  state: PlaybookUIState,
  { payload }: PayloadAction<{ id: string }>,
) => {
  const { id } = payload;
  const playbook = state.currentPlaybook;
  const tasks = playbook?.ui_requirement.tasks ?? [];
  const step = playbook?.steps.find((e) => e.id === id);
  if (!step) return;
  const stepTasks = step.tasks
    .map((task) =>
      tasks.find((t) =>
        typeof task === "string" ? t.id === task : t.id === task.id,
      ),
    )
    .filter((task) => task !== undefined) as Task[];

  const newStepId = generateUUIDWithoutHyphens();
  const newStep: Step = JSON.parse(JSON.stringify(step));
  newStep.id = newStepId;
  newStep.reference_id = uuidv4();
  newStep.tasks = [];
  state.currentPlaybook?.steps.push(newStep);

  stepTasks.forEach((task) => {
    playbookSlice.caseReducers.duplicateTask(state, {
      payload: { id: task.id ?? "", parentStepId: newStepId },
      type: "",
    });
  });

  state.currentVisibleStep = newStep.id;
};
