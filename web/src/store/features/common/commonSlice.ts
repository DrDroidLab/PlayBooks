import { createSlice } from "@reduxjs/toolkit";
import * as Actions from "./slices";
import { initialState } from "./initialState";

export * from "./selectors";

const commonSlice = createSlice({
  name: "common",
  initialState: initialState,
  reducers: {
    setCommonKey: Actions.setCommonKey,
  },
});

export const { setCommonKey } = commonSlice.actions;

export default commonSlice.reducer;
