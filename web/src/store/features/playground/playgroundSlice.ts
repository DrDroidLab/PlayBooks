import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Playground } from '../../../types';

const initialState: Playground = {
  id: null,
  name: '',
  steps: [],
  globalVariables: []
};

const playgroundSlice = createSlice({
  name: 'playground',
  initialState,
  reducers: {
    addStep: state => {
      state.steps.forEach(step => {
        step.isOpen = false;
      });
      state.steps.push({
        description: `Step - ${state.steps.length + 1}`,
        modelType: '',
        source: '',
        isOpen: true,
        isPlayground: true
      });
    },
    setPlayground: (state, { payload }) => {
      state.globalVariables = Object.entries(payload.global_variable_set ?? {}).map(val => {
        return {
          name: val[0] as string,
          value: val[1] as string
        };
      });
    },
    toggleStep: (state, { payload }) => {
      state.steps[payload.index].isOpen = !state.steps[payload.index].isOpen;
    },
    deleteStep: (state, { payload }) => {
      state.steps.splice(payload, 1);
    },
    updateStep: (state, { payload }) => {
      state.steps[payload.index][payload.key] = payload.value;
    },
    updateTitle: (state, { payload }) => {
      state.steps[payload.index].description = payload.description;
    },
    changeProgress: (state, { payload }) => {
      state.steps[payload.index].executioninprogress = payload.progress;
    },
    selectSourceAndModel: (
      state,
      { payload }: PayloadAction<{ index: number; source: string; modelType: string; key: string }>
    ) => {
      state.steps[payload.index] = {
        source: payload.source,
        description: state.steps[payload.index].description,
        assets: [],
        isOpen: true,
        isPlayground: true,
        globalVariables: state.globalVariables ?? []
      };
      state.steps[payload.index].source = payload.source;
      state.steps[payload.index].modelType = payload.modelType;
      state.steps[payload.index].selectedSource = payload.key;
    },
    selectNamespace: (state, { payload }) => {
      state.steps[payload.index].namespaceName = payload.namespace;
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
        [payload.option.option.variable]: payload.option.id
      };
    },
    setDimensionIndex(state, { payload }) {
      state.steps[payload.index].dimensionIndex = payload.dimensionIndex;
      state.steps[payload.index].dimensionName = payload.dimension.split(': ')[0];
      state.steps[payload.index].dimensionValue = payload.dimension.split(': ')[1];
    },
    setMetric(state, { payload }) {
      state.steps[payload.index].metric = payload.metric;
    },
    setDatabase(state, { payload }) {
      state.steps[payload.index].database = payload.database;
    },
    setDbQuery(state, { payload }) {
      state.steps[payload.index].dbQuery = payload.query;
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
      state.globalVariables = [];
    },
    setSteps(state, { payload }) {
      state.steps = payload;
    },
    setApplicationName(state, { payload }) {
      state.steps[payload.index].application_name = payload.application_name;

      state.steps[payload.index].golden_metric = undefined;
    },
    setGoldenMetric(state, { payload }) {
      state.steps[payload.index].golden_metric = payload.metric;
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
        [payload.key]: payload.value
      };
    },
    setDatadogService(state, { payload }) {
      state.steps[payload.index].datadogService = payload.service;
    },
    setDatadogMetricFamily(state, { payload }) {
      state.steps[payload.index].datadogMetricFamily = payload.metric;
    },
    setDataDogEnvironment(state, { payload }) {
      state.steps[payload.index].datadogEnvironment = payload.environment;
    }
  }
});

export const {
  addStep,
  setPlayground,
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
  setGrafanaOptions,
  setGrafanaExpression,
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
  setDataDogEnvironment
} = playgroundSlice.actions;

export default playgroundSlice.reducer;

export const playgroundSelector = state => state.playground;
