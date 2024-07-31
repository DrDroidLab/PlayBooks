import { PayloadAction } from "@reduxjs/toolkit";
import {
  PlaybookUIState,
  Step,
  Task,
  TaskType,
} from "../../../../../types/index.ts";
import generateUUIDWithoutHyphens from "../../../../../utils/common/generateUUIDWithoutHyphens.ts";
import { v4 as uuidv4 } from "uuid";

const emptyStep: Step = {
  id: "",
  tasks: [],
  ui_requirement: {
    isOpen: true,
    showError: false,
  },
};

export const createTaskWithSource = (
  state: PlaybookUIState,
  { payload }: PayloadAction<any>,
) => {
  const { parentId, stepId: existingStepId, resultType } = payload;
  const parent = parentId ?? state.currentPlaybook?.steps[0].id;
  const stepId = existingStepId ?? generateUUIDWithoutHyphens();
  const taskId = generateUUIDWithoutHyphens();

  const task: Task = {
    id: taskId,
    reference_id: uuidv4(),
    name: uuidv4(),
    source: payload.source,
    interpreter_type: "BASIC_I",
    task_connector_sources: [],
    ui_requirement: {
      isOpen: true,
      taskType: payload.taskType,
      stepId: stepId,
      model_type: payload.modelType,
      resultType,
    },
    [payload.source.toLowerCase() as TaskType]: {
      type: payload.taskType,
      [payload.taskType.toLowerCase()]: {
        process_function: "timeseries",
        statistic: "Average",
      },
    },
    description: payload.description,
    execution_configuration: {
      is_bulk_execution: false,
      bulk_execution_var_field: "",
    },
  };

  if (existingStepId) {
    const step = state.currentPlaybook?.steps.find((e) => e.id === stepId);
    step?.tasks.push(taskId);
    state.currentPlaybook?.ui_requirement.tasks.push(task);

    state.currentVisibleTask = taskId;

    return;
  }

  const newStep: Step = {
    ...emptyStep,
    id: stepId,
    reference_id: uuidv4(),
    description: `Step`,
    tasks: [task.id!],
  };

  state.currentPlaybook?.steps.push(newStep);
  state.currentPlaybook?.ui_requirement.tasks.push(task);

  const parentStep = state.currentPlaybook?.steps.find(
    (step) => step.id === parent,
  );

  if (
    state.currentPlaybook &&
    (!state.currentPlaybook?.step_relations ||
      state.currentPlaybook?.step_relations?.length === 0)
  ) {
    state.currentPlaybook.step_relations = [];
  }
  state.currentPlaybook?.step_relations?.push({
    id: `edge-${parent}-${stepId}`,
    parent: parentStep!,
    child: newStep,
  });

  state.currentVisibleTask = taskId;
};
