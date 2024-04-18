import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentTrigger: {
    name: "",
    schedule: "run-once",
    action: "action-slack",
  },
};

const triggersSlice = createSlice({
  name: "triggers",
  initialState,
  reducers: {
    setKey(state, { payload }) {
      state.currentTrigger[payload.key] = payload.value;
    },
  },
});

export const { setKey } = triggersSlice.actions;

export default triggersSlice.reducer;

export const currentTriggerSelctor = (state) =>
  state.triggersBeta.currentTrigger;
