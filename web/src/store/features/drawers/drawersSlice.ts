import { createSlice } from "@reduxjs/toolkit";
import { initialState } from "./initialState.ts";
import * as Actions from "./slices";
export * from "./selectors";

const drawersSlice = createSlice({
  name: "drawers",
  initialState: initialState,
  reducers: {
    openDrawer: Actions.openDrawer,
    closeDrawer: Actions.closeDrawer,
    toggleDrawer: Actions.toggleDrawer,
    setAdditionalState: Actions.setAdditionalState,
    setPermanentView: Actions.setPermanentView,
    resetDrawerState: Actions.resetDrawerState,
  },
});

export const {
  openDrawer,
  closeDrawer,
  toggleDrawer,
  setAdditionalState,
  setPermanentView,
  resetDrawerState,
} = drawersSlice.actions;

export default drawersSlice.reducer;
