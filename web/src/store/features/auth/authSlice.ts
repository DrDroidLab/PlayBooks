import { createSlice } from "@reduxjs/toolkit";

type InitialStateType = {
  accessToken: string | null;
  refreshToken?: string | null;
  email?: string | null;
};

const initialState: InitialStateType = {
  accessToken: localStorage.getItem("access_token"),
  refreshToken: localStorage.getItem("access_token"),
  email: localStorage.getItem("email"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, refreshToken, email } = action.payload;
      const refresh_token = refreshToken ?? state.refreshToken;
      const user_email = email ?? state.email;
      state.accessToken = accessToken;
      state.refreshToken = refresh_token;
      state.email = user_email;

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("email", user_email);
    },
    logOut: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.email = null;
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectEmail = (state) => state.auth.email;
