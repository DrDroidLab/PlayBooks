import { RootState } from "../../..";

export const selectAccessToken = (state: RootState) => state.auth.accessToken;
