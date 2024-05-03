import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Playbook } from "../../../types.ts";
import { playbookToSteps } from "../../../utils/parser/playbook/playbookToSteps.ts";
import { integrationSentenceMap } from "../../../utils/integrationGroupList.ts";

const emptyStep = {
  modelType: "",
  source: "",
  assets: [],
  isOpen: true,
  isPlayground: false,
  showError: false,
};

const initialState: Playbook = {
  id: null,
  name: "",
  globalVariables: [],
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
  currentStepIndex: null,
  view: "builder",
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
      state.currentPlaybook = payload;
    },
    setPlaybookData(state, { payload }) {
      state.currentPlaybook.name = payload.name;
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
      state.steps = playbookToSteps(payload, true);
      state.isEditing = true;
    },
    copyPlaybook(state, { payload }) {
      state.name = payload.name;
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
      state.isEditing = false;
    },
    setErrors(state, { payload }) {
      state.steps[payload.index].errors = payload.errors;
    },
    setPlaybookEditing(state, { payload }) {
      state.currentPlaybook.name = payload.name;
      state.currentPlaybook.id = payload.id;
      state.id = payload.id;
      state.name = payload.name;
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
      state.isEditing = true;
      state.steps = playbookToSteps(payload, true);
    },
    setName(state, { payload }) {
      state.name = payload;
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
    setCurrentStepIndex(state, { payload }) {
      if (payload !== null) state.currentStepIndex = payload.toString();
      else state.currentStepIndex = null;
    },
    createStepWithSource(state, { payload }) {
      state.steps.forEach((step) => {
        step.isOpen = false;
      });
      const index = state.steps.length;
      state.steps.push({
        ...{
          source: payload.source,
          modelType: payload.modelType,
          selectedSource: payload.key,
          description:
            state?.steps[index]?.description ??
            integrationSentenceMap[payload.modelType],
          notes: state?.steps[index]?.notes,
          assets: [],
          isOpen: true,
          isPlayground: false,
          globalVariables: state.globalVariables ?? [],
          showError: false,
        },
        globalVariables: state.globalVariables ?? [],
      });

      // state.currentStepIndex = index.toString();
    },
    addStep: (state) => {
      state.steps.forEach((step) => {
        step.isOpen = false;
      });
      state.steps.push({
        ...emptyStep,
        globalVariables: state.globalVariables ?? [],
      });
    },
    toggleStep: (state, { payload }) => {
      state.steps[payload.index].isOpen = !state.steps[payload.index].isOpen;
    },
    deleteStep: (state, { payload }) => {
      state.steps.splice(payload, 1);
      state.currentStepIndex = null;
    },
    updateStep: (state, { payload }) => {
      state.steps[payload.index][payload.key] = payload.value;
    },
    updateTitle: (state, { payload }) => {
      state.steps[payload.index].description = payload.description;
    },
    changeProgress: (state, { payload }) => {
      console.log(payload);
      state.steps[payload.index].executioninprogress = payload.progress;
    },
    selectSourceAndModel: (
      state,
      {
        payload,
      }: PayloadAction<{
        index: number;
        source: string;
        modelType: string;
        key: string;
      }>,
    ) => {
      const currentStep = state.steps[payload.index];
      if (
        currentStep.source === payload.source &&
        currentStep.modelType === payload.modelType
      )
        return;
      state.steps[payload.index] = {
        source: payload.source,
        description: state?.steps[payload.index]?.description,
        notes: state?.steps[payload.index]?.notes,
        assets: [],
        isOpen: true,
        isPlayground: false,
        globalVariables: state.globalVariables ?? [],
        showError: false,
      };
      state.steps[payload.index].source = payload.source;
      state.steps[payload.index].modelType = payload.modelType;
      state.steps[payload.index].selectedSource = payload.key;
    },
    selectNamespace: (state, { payload }) => {
      state.steps[payload.index].namespaceName = payload.namespace;
      state.steps[payload.index].region = undefined;
      state.steps[payload.index].dimensionIndex = undefined;
      state.steps[payload.index].dimensionName = undefined;
      state.steps[payload.index].dimensionValue = undefined;
      state.steps[payload.index].metric = undefined;
    },
    setModelTypeOptions: (state, { payload }) => {
      state.steps[payload.index].modelTypeOptions = payload.options;
    },
    setAssets(state, { payload }) {
      state.steps[payload.index].assets = payload?.assets;
    },
    setRegion(state, { payload }) {
      state.steps[payload.index].region = payload.region;
      state.steps[payload.index].logGroup = null;
      state.steps[payload.index].dimensionIndex = undefined;
      state.steps[payload.index].dimensionName = undefined;
      state.steps[payload.index].dimensionValue = undefined;
      state.steps[payload.index].metric = undefined;
    },
    setLogGroup(state, { payload }) {
      state.steps[payload.index].logGroup = payload.logGroup;
    },
    setLogQuery(state, { payload }) {
      state.steps[payload.index].cw_log_query = payload.logQuery;
    },
    setDashboard(state, { payload }) {
      state.steps[payload.index].dashboard = payload.dashboard;

      state.steps[payload.index].panel = null;
      state.steps[payload.index].page = null;
      state.steps[payload.index].widget = null;
    },
    setApplicationName(state, { payload }) {
      state.steps[payload.index].application_name = payload.application_name;

      state.steps[payload.index].golden_metric = undefined;
    },
    setGoldenMetric(state, { payload }) {
      state.steps[payload.index].golden_metric = payload.metric;
    },
    setPanel(state, { payload }) {
      state.steps[payload.index].panel = payload.panel;
      state.steps[payload.index].grafanaQuery = null;
      state.steps[payload.index].options = null;
      state.steps[payload.index].selectedOptions = null;
    },
    setGrafanaQuery(state, { payload }) {
      state.steps[payload.index].grafanaQuery = payload.query;
      state.steps[payload.index].options = null;
      state.steps[payload.index].selectedOptions = null;
    },
    setGrafanaExpression(state, { payload }) {
      state.steps[payload.index].grafanaQuery.expression = payload.expression;
    },
    setGrafanaOptions(state, { payload }) {
      state.steps[payload.index].options = payload.options;
    },
    setSelectedGrafanaOptions(state, { payload }) {
      state.steps[payload.index].selectedOptions = {
        ...state.steps[payload.index].selectedOptions,
        [payload.option.option.variable]: payload.option.id,
      };
    },
    setDimensionIndex(state, { payload }) {
      state.steps[payload.index].dimensionIndex = payload.dimensionIndex;
      state.steps[payload.index].dimension = payload.dimension;
      state.steps[payload.index].dimensionName =
        payload.dimension.split(": ")[0];
      state.steps[payload.index].dimensionValue =
        payload.dimension.split(": ")[1];
      state.steps[payload.index].metric = undefined;
    },
    setMetric(state, { payload }) {
      state.steps[payload.index].metric = payload.metric;
    },
    setDatabase(state, { payload }) {
      state.steps[payload.index].database = payload.database;
    },
    setCluster(state, { payload }) {
      state.steps[payload.index].cluster = payload.cluster;
    },
    setDbQuery(state, { payload }) {
      state.steps[payload.index].dbQuery = payload.query;
    },
    setQuery1(state, { payload }) {
      state.steps[payload.index].query1 = payload.query;
    },
    setQuery2(state, { payload }) {
      state.steps[payload.index].query2 = payload.query;
    },
    setFormula(state, { payload }) {
      state.steps[payload.index].formula = payload.formula;
    },
    setRequiresFormula(state, { payload }) {
      state.steps[payload.index].requiresFormula = payload.requiresFormula;
    },
    setCommand(state, { payload }) {
      state.steps[payload.index].command = payload.command;
    },
    setTextNotes(state, { payload }) {
      state.steps[payload.index].textNotes = payload.text;
    },
    addNotes(state, { payload }) {
      state.steps[payload.index].notes = payload.notes;
    },
    addExternalLinks(state, { payload }) {
      state.steps[payload.index].externalLinks = payload.externalLinks;
    },
    resetState(state) {
      state.steps = [];
      state.name = "";
      state.globalVariables = [];
      state.currentPlaybook = {};
      state.isEditing = false;
      state.lastUpdatedAt = null;
      state.currentStepIndex = null;
      state.view = initialState.view;
    },
    setSteps(state, { payload }) {
      state.steps = payload;
    },
    setPage(state, { payload }) {
      state.steps[payload.index].page = payload.page;
      state.steps[payload.index].widget = null;
    },
    setWidget(state, { payload }) {
      state.steps[payload.index].widget = payload.widget;
    },
    setNRQLData(state, { payload }) {
      state.steps[payload.index].nrqlData = {
        ...state.steps[payload.index].nrqlData,
        [payload.key]: payload.value,
      };
    },
    setDatadogService(state, { payload }) {
      state.steps[payload.index].datadogService = payload.service;
      state.steps[payload.index].datadogMetricFamily = undefined;
      state.steps[payload.index].datadogEnvironment = undefined;
      state.steps[payload.index].datadogMetric = undefined;
    },
    setDatadogMetricFamily(state, { payload }) {
      state.steps[payload.index].datadogMetricFamily = payload.metric;
      state.steps[payload.index].datadogEnvironment = undefined;
      state.steps[payload.index].datadogMetric = undefined;
    },
    setDataDogEnvironment(state, { payload }) {
      state.steps[payload.index].datadogEnvironment = payload.environment;
      state.steps[payload.index].datadogMetric = undefined;
    },
    setDatadogMetric(state, { payload }) {
      state.steps[payload.index].datadogMetric = payload.metric;
    },
    setLastUpdatedAt(state) {
      state.lastUpdatedAt = new Date();
    },
    selectEksRegion(state, { payload }) {
      state.steps[payload.index].eksRegion = payload.region;
      state.steps[payload.index].eksNamespace = undefined;
      state.steps[payload.index].cluster = undefined;
      state.steps[payload.index].command = undefined;
    },
    selectCluster(state, { payload }) {
      state.steps[payload.index].cluster = payload.cluster;
      state.steps[payload.index].eksNamespace = undefined;
      state.steps[payload.index].command = undefined;
    },
    selectEksNamespace(state, { payload }) {
      state.steps[payload.index].eksNamespace = payload.namespace;
      state.steps[payload.index].command = undefined;
    },
  },
});

export const {
  setPlaybooks,
  setPlaybookEditing,
  setPlaybookData,
  setCurrentPlaybook,
  setPlaybookDataBeta,
  copyPlaybook,
  addGlobalVariable,
  deleteVariable,
  updateGlobalVariable,
  setName,
  setMeta,
  setCurrentStepIndex,
  createStepWithSource,
  addStep,
  toggleStep,
  deleteStep,
  updateStep,
  updateTitle,
  changeProgress,
  selectSourceAndModel,
  setModelTypeOptions,
  selectNamespace,
  setTextNotes,
  setAssets,
  setRegion,
  setLogGroup,
  setLogQuery,
  setDashboard,
  setPanel,
  setGrafanaQuery,
  setGrafanaExpression,
  setGrafanaOptions,
  setSelectedGrafanaOptions,
  setDimensionIndex,
  setMetric,
  setDatabase,
  setDbQuery,
  addNotes,
  addExternalLinks,
  resetState,
  setSteps,
  setPage,
  setWidget,
  setApplicationName,
  setGoldenMetric,
  setNRQLData,
  setDatadogService,
  setDatadogMetricFamily,
  setDataDogEnvironment,
  setDatadogMetric,
  setLastUpdatedAt,
  setCluster,
  setCommand,
  setErrors,
  selectEksNamespace,
  selectEksRegion,
  selectCluster,
  setRequiresFormula,
  setQuery1,
  setQuery2,
  setFormula,
  setView,
} = playbookSlice.actions;

export default playbookSlice.reducer;

export const playbookSelector = (state) => state.playbook;
export const stepsSelector = (state) => state.playbook?.steps ?? [];
export const playbooksSelector = (state) => state.playbook.playbooks;
export const metaSelector = (state) => state.playbook.meta;
