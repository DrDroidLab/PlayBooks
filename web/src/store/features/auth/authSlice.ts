import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../..";

type InitialStateType = {
  accessToken: string | null;
  refreshToken?: string | null;
  email?: string | null;
  user?: any;
  lastLogin?: string | null;
  providers: string[];
};

const initialState: InitialStateType = {
  accessToken: localStorage.getItem("access_token"),
  refreshToken: localStorage.getItem("access_token"),
  email: localStorage.getItem("email"),
  user: undefined,
  lastLogin: localStorage.getItem("lastLogin"),
  providers: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, refreshToken, email } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken ?? state.refreshToken;
      state.email = email ?? state.email;
    },
    setUser: (state, { payload }) => {
      state.user = payload;
    },
    logOut: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.email = null;
    },
    setLastLogin: (state, { payload }) => {
      state.lastLogin = payload;
    },
    setProviders: (state, { payload }) => {
      state.providers = payload;
    },
  },
});

export const { setCredentials, logOut, setLastLogin, setUser, setProviders } =
  authSlice.actions;

export default authSlice.reducer;

export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectEmail = (state: RootState) => state.auth.email;
export const selectLastLogin = (state: RootState) => state.auth.lastLogin;
export const selectCurrentUser = (state: RootState) => state.auth.user;
