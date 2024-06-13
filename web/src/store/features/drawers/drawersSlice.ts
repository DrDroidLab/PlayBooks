import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../..";
import { DrawerTypes } from "./drawerTypes.ts";

const initialState = {
  ...Object.fromEntries(
    Object.values(DrawerTypes).map((type) => [type, false]),
  ),
  additonalState: {},
};

const drawersSlice = createSlice({
  name: "drawers",
  initialState,
  reducers: {
    openDrawer(state, { payload }) {
      state[payload] = true;
    },
    closeDrawer(state, { payload }) {
      state[payload] = false;
      state.additonalState = {};
    },
    toggleDrawer(state, { payload }) {
      if (!state[payload]) state.additonalState = {};
      state[payload] = !state[payload];
    },
    setAdditionalState(state, { payload }) {
      state.additonalState = payload;
    },
  },
});

export const { openDrawer, closeDrawer, toggleDrawer, setAdditionalState } =
  drawersSlice.actions;

export default drawersSlice.reducer;

export const drawersSelector = (state: RootState) => state.drawers;
export const additonalStateSelector = (state: RootState) =>
  state.drawers.additonalState;
