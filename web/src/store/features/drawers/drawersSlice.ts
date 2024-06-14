import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../..";
import { DrawerTypes } from "./drawerTypes.ts";

const initialState = Object.fromEntries(
  Object.values(DrawerTypes).map((type) => [type, false]),
);

const drawersSlice = createSlice({
  name: "drawers",
  initialState,
  reducers: {
    openDrawer(state, { payload }) {
      state[payload] = true;
    },
    closeDrawer(state, { payload }) {
      state[payload] = false;
    },
    toggleDrawer(state, { payload }) {
      state[payload] = !state[payload];
    },
  },
});

export const { openDrawer, closeDrawer, toggleDrawer } = drawersSlice.actions;

export default drawersSlice.reducer;

export const drawersSelector = (state: RootState) => state.drawers;
