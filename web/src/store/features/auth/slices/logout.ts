import { InitialStateType } from "../initialState";

export const logout = (state: InitialStateType) => {
  state.accessToken = null;
  state.refreshToken = null;
  state.email = null;
};
