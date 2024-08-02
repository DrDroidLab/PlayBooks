import { RootState } from "../../..";

export const selectLastLogin = (state: RootState) => state.auth.lastLogin;
