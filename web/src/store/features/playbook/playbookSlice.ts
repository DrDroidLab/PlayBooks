import { createSlice } from "@reduxjs/toolkit";
import { playbookToSteps } from "../../../utils/parser/playbook/playbookToSteps.ts";
import { integrationSentenceMap } from "../../../utils/integrationOptions/index.ts";
import { PermanentDrawerTypes } from "../drawers/permanentDrawerTypes.ts";
import playbookToEdges from "../../../utils/parser/playbook/playbookToEdges.ts";
import generateUUIDWithoutHyphens from "../../../utils/generateUUIDWithoutHyphens.ts";
import { Step, PlaybookUIState, TaskType } from "../../../types/index.ts";

const emptyStep: Step = {
  id: "",
  tasks: [],
  uiRequirements: {
    isOpen: true,
    showError: false,
  },
};

const initialState: PlaybookUIState = {
  playbooks: [],
  currentPlaybook: {
    id: "",
    global_variable_set: [],
    steps: [],
    step_relations: [],
    ui_requirement: {
      tasks: [],
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
};

const playbookSlice = createSlice({
  name: "playbook",
  initialState,
  reducers: {
    setPlaybooks(state, { payload }) {
      if (Object.keys(state.meta).length > 0) {
        state.playbooks.push(...payload);
      } else {
        state.playbooks = [...payload];
      }
    },
    setCurrentPlaybook(state, { payload }) {
      state.currentPlaybook = payload;
    },
    setPlaybookData(state, { payload }) {
      state.currentPlaybook = payload;
    },
    setPlaybookDataBeta(state, { payload }) {
      state.currentPlaybook = payload;
      state.currentPlaybook!.steps = playbookToSteps(payload, false) as any;
      state.currentPlaybook!.step_relations = playbookToEdges(
        payload,
        [],
      ) as any;
    },
    copyPlaybook(state, { payload }) {
      const useState = payload.useState;

      if (useState) {
        state.currentPlaybook!.name = "Copy of " + state.currentPlaybook!.name;
        state.isCopied = true;
        state.isEditing = false;
        return;
      }

      state.currentPlaybook = payload;
      state.currentPlaybook!.name = "Copy of " + payload.name;
      state.currentPlaybook!.description = payload.description;
      state.isCopied = true;
      state.currentPlaybook!.steps = playbookToSteps(payload, true) as any;
      state.currentPlaybook!.step_relations = playbookToEdges(payload, []);
      state.isEditing = false;
    },
    setErrors(state, { payload }) {
      const { id, errors } = payload;
      if (id) {
        const step = state.currentPlaybook!.steps?.find(
          (step) => step.id === id,
        );
        if (step) {
          step.uiRequirements.errors = errors;
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
      state.currentVisibleTask = payload;
    },
    showTaskConfig(state, { payload }) {
      state.currentVisibleTask = payload.toString();
      const task = state.currentPlaybook!.ui_requirement.tasks.find(
        (task) => task.id === state.currentVisibleTask,
      );
      if (task) task.ui_requirement.isOpen = true;
    },
    createTaskWithSource(state, { payload }) {
      const parentId = payload.parentId;
      const parentExists = parentId !== null && parentId !== undefined;
      const stepId = generateUUIDWithoutHyphens();
      const taskId = generateUUIDWithoutHyphens();

      const newStep = {
        ...emptyStep,
        id: stepId,
        tasks: [
          {
            id: taskId,
            source: payload.source,
            interpreter_type: "",
            task_connector_sources: [],
            ui_requirement: {
              isOpen: true,
              position: {
                x: 0,
                y: 0,
              },
            },
            [payload.taskType as TaskType]: {},
            description:
              payload.description ?? integrationSentenceMap[payload.modelType],
          },
        ],
      };

      state.currentPlaybook!.steps.push(newStep);

      const parentStep = state.currentPlaybook!.steps.find(
        (step) => step.id === parentId,
      );

      if (parentExists) {
        state.currentPlaybook!.step_relations.push({
          id: `edge-${parentId}-${stepId}`,
          parent: parentStep!,
          child: newStep,
        });
      } else {
        state.currentPlaybook!.step_relations.push({
          id: `edge-${parentId}-${stepId}`,
          parent: "playbook",
          child: newStep,
        });
      }

      state.currentVisibleTask = taskId;
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
    // addStep: (state, { payload }) => {
    //   const { parentId, addConditions, id } = payload;
    //   state.steps.forEach((step) => {
    //     step.isOpen = false;
    //   });
    //   const index = state.steps.length;
    //   const currentStep = {
    //     ...emptyStep,
    //     id: id ?? generateUUIDWithoutHyphens(),
    //     description: `Step-${index + 1}`,
    //     stepIndex: index,
    //     globalVariables: state.globalVariables ?? [],
    //     position: {
    //       x: 0,
    //       y: 0,
    //     },
    //   };
    //   state.steps.push(currentStep);
    //   if (parentId !== undefined) {
    //     state.playbookEdges.push({
    //       id: `edge-${parentId}-${currentStep.id}`,
    //       source: `node-${parentId}`,
    //       target: `node-${currentStep.id}`,
    //       type: "custom",
    //       conditions: addConditions
    //         ? [
    //             {
    //               function: "",
    //               operation: "",
    //               value: "",
    //             },
    //           ]
    //         : [],
    //       globalRule: addConditions ? ruleOptions[0].id : undefined,
    //     });
    //   } else {
    //     state.playbookEdges.push({
    //       id: `edge-${currentStep.id}`,
    //       source: `playbook`,
    //       target: `node-${currentStep.id}`,
    //     });
    //   }

    //   state.currentStepId = currentStep.id.toString();
    //   state.permanentView = addConditions
    //     ? PermanentDrawerTypes.STEP_DETAILS
    //     : PermanentDrawerTypes.CONDITION;
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
          const taskIds = step.tasks.map((task) => task.id);
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
    updateTask: (state, { payload }) => {
      const id = payload.id;
      const task = state.currentPlaybook!.ui_requirement.tasks.find(
        (e) => e.id === id,
      );
      if (task) {
        task[payload.key] = payload.value;
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
        const step = state.currentPlaybook!.steps?.find(
          (step) => step.id === id,
        );
        if (step) {
          step.notes = notes;
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
        const step = state.currentPlaybook!.steps?.find(
          (step) => step.id === id,
        );
        if (step)
          step.uiRequirements.showExternalLinks =
            !step.uiRequirements.showExternalLinks;
      }
    },
    toggleNotesVisibility(state, { payload }) {
      const { id } = payload;
      if (id) {
        const step = state.currentPlaybook!.steps?.find(
          (step) => step.id === id,
        );
        if (step)
          step.uiRequirements.showNotes = !step.uiRequirements.showNotes;
      }
    },
    resetState(state) {
      state.currentPlaybook = undefined;
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
      // state.steps = state.steps.map((step) => ({
      //   ...step,
      //   showOutput: false,
      //   outputError: "",
      //   showError: false,
      //   outputLoading: false,
      //   outputs: [],
      //   relationLogs: [],
      // }));
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
  },
});

export const {
  setPlaybooks,
  setPlaybookData,
  setCurrentPlaybook,
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
  resetExecutions,
  pushToExecutionStack,
  popFromExecutionStack,
} = playbookSlice.actions;

export default playbookSlice.reducer;

export const playbookSelector = (state) => state.playbook;
export const stepsSelector = (state) => state.playbook?.steps ?? [];
export const playbooksSelector = (state) => state.playbook.playbooks;
export const metaSelector = (state) => state.playbook.meta;
