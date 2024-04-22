import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentWorkflow: {
    name: "",
    schedule: "run-once",
    action: "",
  },
};

const workflowSlice = createSlice({
  name: "workflows",
  initialState,
  reducers: {
    setKey(state, { payload }) {
      state.currentWorkflow[payload.key] = payload.value;
    },
  },
});

export const { setKey } = workflowSlice.actions;

export default workflowSlice.reducer;

export const currentWorkflowSelector = (state) =>
  state.workflows.currentWorkflow;
