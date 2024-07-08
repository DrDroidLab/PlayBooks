import { createSlice } from "@reduxjs/toolkit";
import { integrationSentenceMap } from "../../../utils/integrationOptions/index.ts";
import { PermanentDrawerTypes } from "../drawers/permanentDrawerTypes.ts";
import generateUUIDWithoutHyphens from "../../../utils/generateUUIDWithoutHyphens.ts";
import { Step, PlaybookUIState, TaskType } from "../../../types/index.ts";
import { RootState } from "../../index.ts";
import { Task } from "../../../types/task.ts";
import setNestedValue from "../../../utils/setNestedValue.ts";
import { v4 as uuidv4 } from "uuid";
import { LogicalOperator } from "../../../types/stepRelations.ts";

const firstStepId = generateUUIDWithoutHyphens();
const firstStep: Step = {
  id: firstStepId,
  description: `Step-${firstStepId}`,
  reference_id: uuidv4(),
  tasks: [],
  ui_requirement: {
    isOpen: true,
    showError: false,
    stepIndex: 0,
  },
};

const emptyStep: Step = {
  id: "",
  tasks: [],
  ui_requirement: {
    isOpen: true,
    showError: false,
  },
};

const initialState: PlaybookUIState = {
  playbooks: [],
  currentPlaybook: {
    id: undefined,
    global_variable_set: {},
    steps: [firstStep],
    step_relations: [],
    ui_requirement: {
      tasks: [],
      isExisting: false,
    },
  },
  meta: {
    page: {
      limit: 10,
      offset: 0,
    },
  },
  shouldScroll: undefined,
  permanentView: undefined,
  executionId: undefined,
  isOnPlaybookPage: false,
  isCopied: false,
  isEditing: false,
  executionStack: [],
  zoomLevel: 0.75,
  connectorOptions: [],
};

const playbookSlice = createSlice({
  name: "playbook",
  initialState,
  reducers: {
    setPlaybooks(state, { payload }) {
      if (Object.keys(state.meta ?? {}).length > 0) {
        state.playbooks.push(...payload);
      } else {
        state.playbooks = [...payload];
      }
    },
    setPlaybookData(state, { payload }) {
      state.currentPlaybook = payload;
    },
    setPlaybookDataBeta(state, { payload }) {
      state.currentPlaybook = payload;
    },
    copyPlaybook(state, { payload }) {
      // const useState = payload.useState;
      // if (useState) {
      //   state.currentPlaybook!.name = "Copy of " + state.currentPlaybook!.name;
      //   state.isCopied = true;
      //   state.isEditing = false;
      //   return;
      // }
      // state.currentPlaybook = payload;
      // state.currentPlaybook!.name = "Copy of " + payload.name;
      // state.currentPlaybook!.description = payload.description;
      // state.isCopied = true;
      // state.isEditing = false;
    },
    setErrors(state, { payload }) {
      const { id, errors } = payload;
      if (id) {
        const task = state.currentPlaybook!.ui_requirement.tasks?.find(
          (step) => step.id === id,
        );
        if (task) {
          task.ui_requirement.errors = errors;
        }
      }
    },
    addGlobalVariable(state, { payload }) {
      state.currentPlaybook!.global_variable_set[payload.name] = payload.value;
    },
    deleteVariable(state, { payload }) {
      if (state.currentPlaybook!.global_variable_set[payload.name])
        delete state.currentPlaybook!.global_variable_set[payload.name];
    },
    updateGlobalVariable(state, { payload }) {
      state.currentPlaybook!.global_variable_set[payload.name] = payload.value;
    },
    setMeta(state, { payload }) {
      state.meta = payload;
    },
    setCurrentVisibleTask(state, { payload }) {
      state.currentVisibleStep = undefined;
      state.currentVisibleTask = payload;
    },
    setCurrentVisibleStep(state, { payload }) {
      state.currentVisibleTask = undefined;
      state.currentVisibleStep = payload;
    },
    showTaskConfig(state, { payload }) {
      state.currentVisibleTask = payload.toString();
      const task = state.currentPlaybook!.ui_requirement.tasks.find(
        (task) => task.id === state.currentVisibleTask,
      );
      if (task) task.ui_requirement.isOpen = true;
    },
    createTaskWithSource(state, { payload }) {
      const { parentId, stepId: existingStepId, resultType } = payload;
      const parent = parentId ?? state.currentPlaybook?.steps[0].id;
      const stepId = existingStepId ?? generateUUIDWithoutHyphens();
      const taskId = generateUUIDWithoutHyphens();

      const task: Task = {
        id: taskId,
        reference_id: uuidv4(),
        source: payload.source,
        interpreter_type: "BASIC_I",
        task_connector_sources: [],
        ui_requirement: {
          isOpen: true,
          position: {
            x: 0,
            y: 0,
          },
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
        description:
          payload.description ?? integrationSentenceMap[payload.modelType],
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
        description: `Step-${stepId}`,
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
    },
    addStep: (state, { payload }) => {
      const { parentId, id, addCondition } = payload;
      const stepId = id ?? generateUUIDWithoutHyphens();
      const newStep: Step = {
        ...emptyStep,
        id: stepId,
        reference_id: uuidv4(),
        description: `Step-${stepId}`,
        tasks: [],
      };
      state.currentPlaybook?.steps.push(newStep);
      const parentStep = state.currentPlaybook?.steps.find(
        (step) => step.id === parentId,
      );
      if (
        state.currentPlaybook &&
        (!state.currentPlaybook?.step_relations ||
          state.currentPlaybook?.step_relations?.length === 0)
      ) {
        state.currentPlaybook.step_relations = [];
      }
      state.currentPlaybook?.step_relations?.push({
        id: `edge-${parentId}-${stepId}`,
        parent: parentStep!,
        child: newStep,
        condition: addCondition
          ? {
              logical_opertaor: LogicalOperator.OR_LO,
              rules: [],
            }
          : undefined,
      });
    },
    // addParentId: (state, { payload }) => {
    //   const { id, parentId } = payload;
    //   const parentExists = parentId !== undefined && parentId !== null;
    //   const edgeId = parentExists ? `edge-${parentId}-${id}` : `edge-${id}`;
    //   state.playbookEdges.filter((e) => e.id !== id);
    //   state.playbookEdges.push({
    //     id: edgeId,
    //     source: parentExists ? `node-${parentId}` : `playbook`,
    //     target: `node-${id}`,
    //     type: "custom",
    //   });
    // },
    deleteStep: (state, { payload }) => {
      const id = payload;
      if (id) {
        const step = state.currentPlaybook!.steps.find(
          (step) => step.id === id,
        );
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
          state.currentPlaybook!.step_relations.filter((relation) =>
            relation.id.includes(id),
          );
        }
        state.permanentView = PermanentDrawerTypes.DEFAULT;
      }
    },
    deleteTask: (state, { payload }) => {
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
    },
    updateTask: (state, { payload }) => {
      const id = payload.id;
      let task = state.currentPlaybook!.ui_requirement.tasks.find(
        (e) => e.id === id,
      );
      if (task) {
        task = setNestedValue(task, payload.key, payload.value);
      }
    },
    updateStep: (state, { payload }) => {
      const id = payload.id;
      let step = state.currentPlaybook!.steps.find((e) => e.id === id);
      if (step) {
        step = setNestedValue(step, payload.key, payload.value);
      }
    },
    updateSource: (state, { payload }) => {
      const id = payload.id;
      let task = state.currentPlaybook!.ui_requirement.tasks.find(
        (e) => e.id === id,
      );
      if (task) {
        delete task[task?.source?.toLowerCase()];
        task.source = payload.value;
        task[task?.source?.toLowerCase()] = {};
      }
    },
    updateTaskType: (state, { payload }) => {
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
    },
    setAssets(state, { payload }) {
      const { id } = payload;
      if (id) {
        const task = state.currentPlaybook!.ui_requirement.tasks?.find(
          (task) => task.id === id,
        );
        if (task) task.ui_requirement.assets = payload.assets;
      }
    },
    addNotes(state, { payload }) {
      const { id, notes } = payload;
      if (id) {
        const task = state.currentPlaybook?.ui_requirement?.tasks?.find(
          (task) => task.id === id,
        );
        if (task) {
          task.notes = notes;
        }
      }
    },
    addExternalLinks(state, { payload }) {
      const { id, links } = payload;
      if (id) {
        const step = state.currentPlaybook!.steps?.find(
          (step) => step.id === id,
        );
        if (step) {
          step.external_links = links;
        }
      }
    },
    toggleExternalLinkVisibility(state, { payload }) {
      const { id } = payload;
      if (id) {
        const step = state.currentPlaybook?.steps?.find(
          (step) => step.id === id,
        );
        if (step)
          step.ui_requirement.showExternalLinks =
            !step.ui_requirement.showExternalLinks;
      }
    },
    toggleNotesVisibility(state, { payload }) {
      const { id } = payload;
      if (id) {
        const task = state.currentPlaybook?.ui_requirement?.tasks?.find(
          (task) => task.id === id,
        );
        if (task)
          task.ui_requirement.showNotes = !task.ui_requirement.showNotes;
      }
    },
    resetState(state) {
      state.currentPlaybook = initialState.currentPlaybook;
      state.currentVisibleTask = undefined;
      state.executionId = undefined;
      state.isCopied = false;
      state.isEditing = false;
      state.isOnPlaybookPage = false;
      state.meta = undefined;
      state.permanentView = PermanentDrawerTypes.DEFAULT;
      state.playbooks = [];
      state.shouldScroll = false;
      state.zoomLevel = 0.75;
    },
    resetExecutions(state) {
      state.executionId = undefined;
    },
    setSteps(state, { payload }) {
      state.currentPlaybook!.steps = payload;
    },
    setNRQLData(state, { payload }) {
      const { id, key, value } = payload;
      const task = state.currentPlaybook?.ui_requirement.tasks?.find(
        (task) => task.id === id,
      );
      if (task) {
        task.ui_requirement.nrqlData = {
          ...task?.ui_requirement.nrqlData,
          [key]: value,
        };
      }
    },
    setActionKey(state, { payload }) {
      // const { id, key, value } = payload;
      // const step = state.steps?.find((step) => step.id === id);
      // if (step) {
      //   step.action[key] = value;
      //   step.isEditing = true;
      // }
    },
    setPlaybookKey(state, { payload }) {
      state[payload.key] = payload.value;
    },
    setCurrentPlaybookKey(state, { payload }) {
      if (state.currentPlaybook)
        state.currentPlaybook[payload.key] = payload.value;
    },
    pushToExecutionStack(state, { payload }) {
      const nextPossibleStepLogs = payload;
      nextPossibleStepLogs.forEach((log) => {
        const stepId = log.relation.child.id;
        if (!state.executionStack.includes(stepId)) {
          state.executionStack.push(stepId);
        }
      });
    },
    popFromExecutionStack(state) {
      if (state.executionStack.length > 0) state.executionStack.pop();
    },
    addRule: (state, { payload }) => {
      const { id } = payload;
      const relation = state.currentPlaybook?.step_relations.find(
        (e) => e.id === id,
      );
      if (!relation) return;
      relation.condition?.rules.push({
        type: "",
        task: "",
      });
    },
    duplicateTask: (state, { payload }) => {
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
    },
  },
});

export const {
  setPlaybooks,
  setPlaybookData,
  setPlaybookDataBeta,
  copyPlaybook,
  createTaskWithSource,
  setCurrentVisibleTask,
  showTaskConfig,
  updateTask,
  addGlobalVariable,
  deleteVariable,
  updateGlobalVariable,
  setMeta,
  deleteStep,
  setAssets,
  addNotes,
  addExternalLinks,
  resetState,
  setSteps,
  setNRQLData,
  setErrors,
  toggleExternalLinkVisibility,
  toggleNotesVisibility,
  setActionKey,
  setPlaybookKey,
  setCurrentPlaybookKey,
  resetExecutions,
  pushToExecutionStack,
  popFromExecutionStack,
  deleteTask,
  updateSource,
  updateTaskType,
  updateStep,
  setCurrentVisibleStep,
  addStep,
  addRule,
  duplicateTask,
} = playbookSlice.actions;

export default playbookSlice.reducer;

export const playbookSelector = (state: RootState) => state.playbook;
export const playbooksSelector = (state: RootState) => state.playbook.playbooks;
export const metaSelector = (state: RootState) => state.playbook.meta;
export const currentPlaybookSelector = (state: RootState) =>
  state.playbook.currentPlaybook;
export const stepsSelector = (state: RootState) =>
  state.playbook.currentPlaybook?.ui_requirement.tasks ?? [];
