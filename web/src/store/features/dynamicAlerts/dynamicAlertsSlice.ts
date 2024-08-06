import { createSlice } from "@reduxjs/toolkit";
import { initialState } from "./initialState";
import * as Actions from "./slices";

const dynamicAlertSlice = createSlice({
  name: "dynamic alert",
  initialState: initialState,
  reducers: {
    setDynamicAlertKey: Actions.setDynamicAlertKey,
    setDynamicAlert: Actions.setDynamicAlert,
  },
});

export const { setDynamicAlertKey, setDynamicAlert } =
  dynamicAlertSlice.actions;

export default dynamicAlertSlice.reducer;
