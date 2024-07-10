import { createSlice } from "@reduxjs/toolkit";

const defaultCode = `import json

def transform(context):
  # TODO implement
  out = "{
    'key1': 'value1',
    'key2': 'value2'
  }"
  return json.loads(out)`;

const exampleInput = `{
  "key1": "value1",
  "key2": "value2"
}`;

const initialState: any = {
  currentWorkflow: {
    name: "",
    schedule: "one_off",
    workflowType: "slack_channel_alert",
    trigger: {},
    errors: {},
    generateSummary: false,
    globalVariables: [],
    useTransformer: false,
    transformerCode: defaultCode,
    exampleInput,
  },
};

const workflowSlice = createSlice({
  name: "workflows",
  initialState,
  reducers: {
    setWorkflowKey(state, { payload }) {
      state[payload.key] = payload.value;
    },
    setCurrentWorkflowKey(state, { payload }) {
      state.currentWorkflow[payload.key] = payload.value;
    },
    setCurrentWorkflowTriggerKey(state, { payload }) {
      state.currentWorkflow.trigger[payload.key] = payload.value;
    },
    setErrorKey(state, { payload }) {
      state.currentWorkflow.errors[payload.key] = payload.value;
    },
    removeErrorKey(state, { payload }) {
      if (state.currentWorkflow.errors && state.currentWorkflow.errors[payload])
        delete state.currentWorkflow.errors[payload];
    },
    resetWorkflowState(state) {
      state.currentWorkflow = initialState.currentWorkflow;
    },
    addGlobalVariable(state, { payload }) {
      const list = state.currentWorkflow.globalVariables ?? [];
      list?.push({
        name: payload.name,
        value: payload.value,
      });
      state.currentWorkflow.globalVariables = list;
    },
    updateGlobalVariable(state, { payload }) {
      const list = state.currentWorkflow.globalVariables ?? [];
      list[payload.index].value = payload.value;
      state.currentWorkflow.globalVariables = list;
    },
    deleteGlobalVariable(state, { payload }) {
      const list = state.currentWorkflow.globalVariables ?? [];
      list.splice(payload.index, 1);
      state.currentWorkflow.globalVariables = list;
    },
  },
});

export const {
  setWorkflowKey,
  setCurrentWorkflowKey,
  setCurrentWorkflowTriggerKey,
  setErrorKey,
  removeErrorKey,
  resetWorkflowState,
  addGlobalVariable,
  updateGlobalVariable,
  deleteGlobalVariable,
} = workflowSlice.actions;

export default workflowSlice.reducer;

export const currentWorkflowSelector = (state) =>
  state.workflows.currentWorkflow;
