import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentWorkflow: {
    name: "",
    schedule: "run-once",
    action: "",
    trigger: {},
  },
};

const workflowSlice = createSlice({
  name: "workflows",
  initialState,
  reducers: {
    setCurrentWorkflowKey(state, { payload }) {
      state.currentWorkflow[payload.key] = payload.value;
    },
    setCurrentWorkflowTriggerKey(state, { payload }) {
      state.currentWorkflow.trigger[payload.key] = payload.value;
    },
  },
});

export const { setCurrentWorkflowKey, setCurrentWorkflowTriggerKey } =
  workflowSlice.actions;

export default workflowSlice.reducer;

export const currentWorkflowSelector = (state) =>
  state.workflows.currentWorkflow;
