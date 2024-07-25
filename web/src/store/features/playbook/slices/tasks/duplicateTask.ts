import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState, Task } from "../../../../../types/index.ts";
import generateUUIDWithoutHyphens from "../../../../../utils/generateUUIDWithoutHyphens.ts";
import { v4 as uuidv4 } from "uuid";

export const duplicateTask = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  const { id, keyToBeRemoved } = payload;
  const playbook = state.currentPlaybook;
  const tasks = playbook?.ui_requirement.tasks ?? [];
  const steps = playbook?.steps ?? [];
  const task = tasks.find((e) => e.id === id);

  if (!task) return;
  const newTaskId = generateUUIDWithoutHyphens();
  const newTask: Task = JSON.parse(JSON.stringify(task));
  newTask.id = newTaskId;
  newTask.reference_id = uuidv4();
  newTask.name = uuidv4();
  newTask.ui_requirement.errors = {};
  const source = newTask.source;
  const type = newTask[source.toLowerCase()].type;
  const data = newTask[source.toLowerCase()][type.toLowerCase()];
  if (keyToBeRemoved) data[keyToBeRemoved] = "";
  const stepId = task.ui_requirement.stepId;
  const step = steps.find((step) => step.id === stepId);
  tasks.push(newTask);
  step?.tasks.push(newTaskId);

  state.currentVisibleTask = newTaskId;
};
