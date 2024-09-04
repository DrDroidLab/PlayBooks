import { createSlice } from "@reduxjs/toolkit";
import { initialState } from "./initialState";
import * as Actions from "./slices";

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: initialState,
  reducers: {
    toggle: Actions.toggle,
  },
});

export const { toggle: toggleSidebar } = sidebarSlice.actions;

export default sidebarSlice.reducer;
