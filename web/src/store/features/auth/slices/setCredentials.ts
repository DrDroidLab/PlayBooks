import { PayloadAction } from "@reduxjs/toolkit";
import { InitialStateType } from "../initialState";

export const setCredentials = (
  state: InitialStateType,
  { payload }: PayloadAction<any>,
) => {
  const { accessToken, refreshToken, email } = payload;
  state.accessToken = accessToken;
  state.refreshToken = refreshToken ?? state.refreshToken;
  state.email = email ?? state.email;
};
