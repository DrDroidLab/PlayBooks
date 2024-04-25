import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentWorkflow: {
    name: "",
    schedule: "one_off",
    workflowType: "slack",
    trigger: {},
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
    resetWorkflowState(state) {
      state.currentWorkflow = initialState.currentWorkflow;
    },
  },
});

export const {
  setWorkflowKey,
  setCurrentWorkflowKey,
  setCurrentWorkflowTriggerKey,
  resetWorkflowState,
} = workflowSlice.actions;

export default workflowSlice.reducer;

export const currentWorkflowSelector = (state) =>
  state.workflows.currentWorkflow;
