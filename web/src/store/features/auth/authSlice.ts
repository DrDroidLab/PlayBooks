import { createSlice } from "@reduxjs/toolkit";
import * as Actions from "./slices";
import { initialState } from "./initialState";
export * from "./selectors";

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setCredentials: Actions.setCredentials,
    setUser: Actions.setUser,
    logOut: Actions.logout,
    setLastLogin: Actions.setLastLogin,
    setProviders: Actions.setProviders,
  },
});

export const { setCredentials, logOut, setLastLogin, setUser, setProviders } =
  authSlice.actions;

export default authSlice.reducer;
