import { createSlice } from "@reduxjs/toolkit";
import { Playbook } from "../../../types.ts";
import { playbookToSteps } from "../../../utils/parser/playbook/playbookToSteps.ts";
import { integrationSentenceMap } from "../../../utils/integrationOptions/index.ts";
import { ruleOptions } from "../../../utils/conditionals/ruleOptions.ts";
import { PermanentDrawerTypes } from "../drawers/permanentDrawerTypes.ts";
import playbookToEdges from "../../../utils/parser/playbook/playbookToEdges.ts";
import generateUUIDWithoutHyphens from "../../../utils/generateUUIDWithoutHyphens.ts";

const emptyStep = {
  modelType: "",
  source: "",
  assets: [],
  isOpen: true,
  isPlayground: false,
  showError: false,
  stepType: null,
  action: {},
  requireCondition: false,
  currentConditionParentIndex: undefined,
};

const initialState: Playbook = {
  id: null,
  name: "",
  globalVariables: [],
  interpreterTypes: [],
  steps: [],
  playbooks: [],
  currentPlaybook: {},
  meta: {
    page: {
      limit: 10,
      offset: 0,
    },
  },
  isEditing: false,
  lastUpdatedAt: null,
  view: "builder",
  shouldScroll: undefined,
  currentVisibleStep: undefined,
  playbookEdges: [],
  permanentView: undefined,
  executionId: undefined,
  currentStepId: undefined,
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
    setView(state, { payload }) {
      state.view = payload;
    },
    setCurrentPlaybook(state, { payload }) {
      state.currentPlaybook = { isPrefetched: true, ...payload };
    },
    setPlaybookData(state, { payload }) {
      state.currentPlaybook.name = payload.name;
      state.description = payload.description;
      state.currentPlaybook.globalVariables = Object.entries(
        payload?.global_variable_set ?? {},
      ).map((val) => {
        return {
          name: val[0] as string,
          value: val[1] as string,
        };
      });
      state.globalVariables = Object.entries(
        payload?.global_variable_set ?? {},
      ).map((val) => {
        return {
          name: val[0] as string,
          value: val[1] as string,
        };
      });
    },
    setPlaybookDataBeta(state, { payload }) {
      state.name = payload.name;
      state.id = payload.id;
      state.globalVariables = Object.entries(
        payload?.global_variable_set ?? {},
      ).map((val) => {
        return {
          name: val[0] as string,
          value: val[1] as string,
        };
      });
      state.globalVariables = Object.entries(
        payload?.global_variable_set ?? {},
      ).map((val) => {
        return {
          name: val[0] as string,
          value: val[1] as string,
        };
      });
      state.steps = playbookToSteps(payload, false);
      state.playbookEdges = playbookToEdges(payload, state.steps);
      state.isEditing = true;
    },
    copyPlaybook(state, { payload }) {
      const useState = payload.useState;

      if (useState) {
        state.name = "Copy of " + state.name;
        state.currentPlaybook.isCopied = true;
        state.isEditing = false;
        return;
      }

      state.name = "Copy of " + payload.name;
      state.description = payload.description;
      state.currentPlaybook.globalVariables = Object.entries(
        payload.global_variable_set ?? {},
      ).map((val) => {
        return {
          name: val[0] as string,
          value: val[1] as string,
        };
      });
      state.globalVariables = Object.entries(
        payload.global_variable_set ?? {},
      ).map((val) => {
        return {
          name: val[0] as string,
          value: val[1] as string,
        };
      });
      state.currentPlaybook.isCopied = true;
      state.steps = playbookToSteps(payload, true);
      state.playbookEdges = playbookToEdges(payload, state.steps);
      state.isEditing = false;
    },
    setErrors(state, { payload }) {
      const { id, errors } = payload;
      if (id) {
        const step = state.steps?.find((step) => step.id === id);
        if (step) {
          step.errors = errors;
        }
      }
    },
    addGlobalVariable(state, { payload }) {
      const list = state.globalVariables ?? [];
      list?.push({
        name: payload.name,
        value: payload.value,
      });
      state.globalVariables = list;

      state.steps.forEach((step) => {
        step.globalVariables = list ?? [];
      });
    },
    deleteVariable(state, { payload }) {
      const list = state.globalVariables ?? [];
      list.splice(payload.index, 1);
      state.globalVariables = list;

      state.steps.forEach((step) => {
        step.globalVariables = list ?? [];
      });
    },
    updateGlobalVariable(state, { payload }) {
      const list = state.globalVariables ?? [];
      list[payload.index].value = payload.value;
      state.globalVariables = list;

      state.steps.forEach((step) => {
        step.globalVariables = list ?? [];
      });
    },
    setMeta(state, { payload }) {
      state.meta = payload;
    },
    setCurrentStepId(state, { payload }) {
      state.currentStepId = payload;
    },
    showStepConfig(state, { payload }) {
      state.currentStepId = payload.toString();
      state.steps.forEach((step) => (step.isOpen = false));
      const step = state.steps.find(
        (e) => e.id?.toString() === state.currentStepId,
      );
      if (step) step.isOpen = true;
    },
    createStepWithSource(state, { payload }) {
      state.steps.forEach((step) => {
        step.isOpen = false;
      });
      const index = state.steps.length;
      const parentId = payload.parentId;
      const parentExists = parentId !== null && parentId !== undefined;
      const id = generateUUIDWithoutHyphens();
      state.steps.push({
        ...{
          id,
          source: payload.source,
          stepIndex: index,
          taskType: payload.taskType,
          modelType: payload.modelType,
          selectedSource: payload.key,
          description:
            state?.steps[index]?.description ??
            payload.description ??
            integrationSentenceMap[payload.modelType],
          notes: state?.steps[index]?.notes,
          assets: [],
          isOpen: true,
          isPlayground: false,
          globalVariables: state.globalVariables ?? [],
          showError: false,
          stepType: "data",
          action: {},
          parentIds: parentExists ? [parentId] : [],
          position: {
            x: 0,
            y: 0,
          },
          requireCondition: payload.requireCondition ?? false,
          currentConditionParentId: payload.currentConditionParentId,
          resultType: payload.resultType,
        },
        globalVariables: state.globalVariables ?? [],
      });

      if (parentExists) {
        state.playbookEdges.push({
          id: `edge-${parentId}-${id}`,
          source: `node-${parentId}`,
          target: `node-${id}`,
          type: "custom",
        });
      } else {
        state.playbookEdges.push({
          id: `edge-${id}`,
          source: `playbook`,
          target: `node-${id}`,
        });
      }

      state.currentStepId = id.toString();
    },
    addParentId: (state, { payload }) => {
      const { id, parentId } = payload;
      const parentExists = parentId !== undefined && parentId !== null;
      const step = state.steps.find((s) => s.id === id);
      if (step?.parentIds && parentExists) {
        step.parentIds.push(parentId);
      }
      const edgeId = parentExists ? `edge-${parentId}-${id}` : `edge-${id}`;
      state.playbookEdges.filter((e) => e.id !== id);
      state.playbookEdges.push({
        id: edgeId,
        source: parentExists ? `node-${parentId}` : `playbook`,
        target: `node-${id}`,
        type: parentExists ? "custom" : "",
      });
    },
    addStep: (state, { payload }) => {
      const { parentId, addConditions } = payload;
      state.steps.forEach((step) => {
        step.isOpen = false;
      });
      const index = state.steps.length;
      const currentStep = {
        ...emptyStep,
        id: generateUUIDWithoutHyphens(),
        description: `Step-${index + 1}`,
        stepIndex: index,
        globalVariables: state.globalVariables ?? [],
        position: {
          x: 0,
          y: 0,
        },
        parentIndexes: parentId !== undefined ? [parentId] : [],
      };
      state.steps.push(currentStep);
      if (parentId !== undefined) {
        state.playbookEdges.push({
          id: `edge-${parentId}-${currentStep.id}`,
          source: `node-${parentId}`,
          target: `node-${currentStep.id}`,
          type: "custom",
          conditions: addConditions
            ? [
                {
                  function: "",
                  operation: "",
                  value: "",
                },
              ]
            : [],
          globalRule: addConditions ? ruleOptions[0].id : undefined,
        });
      } else {
        state.playbookEdges.push({
          id: `edge-${currentStep.id}`,
          source: `playbook`,
          target: `node-${currentStep.id}`,
        });
      }

      console.log("current step", currentStep.id);
      state.currentStepId = currentStep.id.toString();
      state.permanentView = addConditions
        ? PermanentDrawerTypes.STEP_DETAILS
        : PermanentDrawerTypes.CONDITION;
    },
    toggleStep: (state, { payload }) => {
      const id = payload;
      const step = state.steps.find((step) => step.id === id);
      if (step) step.isOpen = !step.isOpen;
    },
    deleteStep: (state, { payload }) => {
      const id = payload;
      if (id) {
        const index = state.steps.findIndex((step) => step.id === id);
        if (index !== undefined && index !== null) state.steps.splice(index, 1);
        state.currentStepId = undefined;
        state.playbookEdges = state.playbookEdges.filter(
          (e) => e.source !== `node-${id}` && e.target !== `node-${id}`,
        );
        state.permanentView = PermanentDrawerTypes.DEFAULT;
      }
    },
    updateStep: (state, { payload }) => {
      const id = payload.id;
      const step = state.steps?.find((step) => step.id === id);
      if (step) step[payload.key] = payload.value;
    },
    setAssets(state, { payload }) {
      const { id } = payload;
      if (id) {
        const step = state.steps?.find((step) => step.id === id);
        if (step) step.assets = payload.assets;
      }
    },
    addNotes(state, { payload }) {
      const { id, notes } = payload;
      if (id) {
        const step = state.steps?.find((step) => step.id === id);
        if (step) step.notes = notes;
      }
    },
    addExternalLinks(state, { payload }) {
      const { id, links } = payload;
      if (id) {
        const step = state.steps?.find((step) => step.id === id);
        if (step) step.externalLinks = links;
      }
    },
    toggleExternalLinkVisibility(state, { payload }) {
      const { id } = payload;
      if (id) {
        const step = state.steps?.find((step) => step.id === id);
        if (step) step.showExternalLinks = !step.showExternalLinks;
      }
    },
    toggleNotesVisibility(state, { payload }) {
      const { id } = payload;
      if (id) {
        const step = state.steps?.find((step) => step.id === id);
        if (step) step.showNotes = !step.showNotes;
      }
    },
    resetState(state) {
      state.steps = [];
      state.name = "";
      state.description = "";
      state.globalVariables = [];
      state.currentPlaybook = {};
      state.isEditing = false;
      state.lastUpdatedAt = undefined;
      state.currentStepId = undefined;
      state.view = initialState.view;
      state.playbookEdges = [];
      state.currentVisibleStep = undefined;
      state.executionId = undefined;
    },
    setSteps(state, { payload }) {
      state.steps = payload;
    },
    setNRQLData(state, { payload }) {
      const { id, key, value } = payload;
      const step = state.steps?.find((step) => step.id === id);
      if (step)
        step.nrqlData = {
          ...step?.nrqlData,
          [key]: value,
        };
    },
    setLastUpdatedAt(state) {
      state.lastUpdatedAt = new Date();
    },
    setActionKey(state, { payload }) {
      const { id, key, value } = payload;
      const step = state.steps?.find((step) => step.id === id);
      if (step) step.action[key] = value;
    },
    setPlaybookKey(state, { payload }) {
      state[payload.key] = payload.value;
    },
  },
});

export const {
  setPlaybooks,
  setPlaybookData,
  setCurrentPlaybook,
  setPlaybookDataBeta,
  copyPlaybook,
  addGlobalVariable,
  deleteVariable,
  updateGlobalVariable,
  setMeta,
  showStepConfig,
  createStepWithSource,
  addStep,
  toggleStep,
  deleteStep,
  updateStep,
  setCurrentStepId,
  setAssets,
  addNotes,
  addExternalLinks,
  resetState,
  setSteps,
  setNRQLData,
  setLastUpdatedAt,
  setErrors,
  setView,
  toggleExternalLinkVisibility,
  toggleNotesVisibility,
  setActionKey,
  setPlaybookKey,
  addParentId,
} = playbookSlice.actions;

export default playbookSlice.reducer;

export const playbookSelector = (state) => state.playbook;
export const stepsSelector = (state) => state.playbook?.steps ?? [];
export const playbooksSelector = (state) => state.playbook.playbooks;
export const metaSelector = (state) => state.playbook.meta;
