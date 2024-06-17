import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../..";
import { DrawerTypes } from "./drawerTypes.ts";

type DrawerTypesKeys = keyof typeof DrawerTypes;

type DrawerInitialState = {
  [key in DrawerTypesKeys]?: boolean;
} & {
  additionalState: Record<string, any>;
};

const initialState: DrawerInitialState = {
  ...Object.fromEntries(Object.keys(DrawerTypes).map((key) => [key, false])),
  additionalState: {},
};

const drawersSlice = createSlice({
  name: "drawers",
  initialState,
  reducers: {
    openDrawer(state, { payload }) {
      state[payload] = true;
    },
    closeDrawer(state, { payload }) {
      const { id, resetState } = payload;
      state[id] = false;
      if (resetState) state.additionalState = {};
    },
    toggleDrawer(state, { payload }) {
      if (!state[payload]) state.additionalState = {};
      state[payload] = !state[payload];
    },
    setAdditionalState(state, { payload }) {
      state.additionalState = payload;
    },
  },
});

export const { openDrawer, closeDrawer, toggleDrawer, setAdditionalState } =
  drawersSlice.actions;

export default drawersSlice.reducer;

export const drawersSelector = (state: RootState) => state.drawers;
export const additionalStateSelector = (state: RootState) =>
  state.drawers.additionalState;
