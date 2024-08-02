import { createSlice } from "@reduxjs/toolkit";
import { initialState } from "./initialState";
import * as Actions from "./slices";

const dynamicAlertSlice = createSlice({
  name: "dynamic alert",
  initialState: initialState,
  reducers: {
    setDynamicAlertKey: Actions.setDynamicAlertKey,
  },
});

export const { setDynamicAlertKey } = dynamicAlertSlice.actions;

export default dynamicAlertSlice.reducer;
