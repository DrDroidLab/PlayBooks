import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../..";
import { DrawerTypes } from "./drawerTypes.ts";
import { PermanentDrawerTypes } from "./permanentDrawerTypes.ts";

type DrawerTypesKeys = keyof typeof DrawerTypes;
export type PermanentDrawerTypesKeys =
  (typeof PermanentDrawerTypes)[keyof typeof PermanentDrawerTypes];

type DrawerInitialState = {
  [key in DrawerTypesKeys]?: boolean;
} & {
  additionalState: Record<string, any>;
  permanentView: PermanentDrawerTypesKeys;
};

const initialState: DrawerInitialState = {
  ...Object.fromEntries(Object.keys(DrawerTypes).map((key) => [key, false])),
  additionalState: {},
  permanentView: PermanentDrawerTypes.DEFAULT,
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
    setPermanentView(state, { payload }) {
      state.permanentView = payload;
    },
    resetDrawerState(state) {
      state.permanentView = PermanentDrawerTypes.DEFAULT;
    },
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

export const drawersSelector = (state: RootState) => state.drawers;
export const additionalStateSelector = (state: RootState) =>
  state.drawers.additionalState;
export const permanentViewSelector = (state: RootState) =>
  state.drawers.permanentView;
