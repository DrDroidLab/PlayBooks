import { createSlice } from "@reduxjs/toolkit";

type InitialStateType = {
  accessToken: string | null;
  refreshToken?: string | null;
  email?: string | null;
  user?: any;
};

const initialState: InitialStateType = {
  accessToken: localStorage.getItem("access_token"),
  refreshToken: localStorage.getItem("access_token"),
  email: localStorage.getItem("email"),
  user: undefined,
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
  },
});

export const { setCredentials, logOut, setUser } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectEmail = (state) => state.auth.email;
