import { createSlice } from "@reduxjs/toolkit";
import { initialState } from "./initialState";
import * as Actions from "./slices";

const dynamicAlertSlice = createSlice({
  name: "dynamic alert",
  initialState: initialState,
  reducers: {
    setDynamicAlertKey: Actions.setDynamicAlertKey,
    setDynamicAlert: Actions.setDynamicAlert,
    resetDynamicAlertState: Actions.resetDynamicAlertState,
  },
});

export const { setDynamicAlertKey, setDynamicAlert, resetDynamicAlertState } =
  dynamicAlertSlice.actions;

export default dynamicAlertSlice.reducer;
