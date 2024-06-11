import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentWorkflow: {
    name: "",
    schedule: "one_off",
    workflowType: "slack_channel_alert",
    trigger: {},
    errors: {},
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
  },
});

export const {
  setWorkflowKey,
  setCurrentWorkflowKey,
  setCurrentWorkflowTriggerKey,
  setErrorKey,
  removeErrorKey,
  resetWorkflowState,
} = workflowSlice.actions;

export default workflowSlice.reducer;

export const currentWorkflowSelector = (state) =>
  state.workflows.currentWorkflow;
