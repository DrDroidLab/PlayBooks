import { createSlice } from "@reduxjs/toolkit";
import { secretsInitialState } from "./initialState";
import * as Actions from "./actions";

export * from "./selectors";

const secretsSlice = createSlice({
  name: "secrets",
  initialState: secretsInitialState,
  reducers: {
    resetSecretState: Actions.resetSecretStateAction,
    setSecretKey: Actions.setSecretKeyAction,
  },
});

export const { resetSecretState, setSecretKey } = secretsSlice.actions;

export default secretsSlice.reducer;
