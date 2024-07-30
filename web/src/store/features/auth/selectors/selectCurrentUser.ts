import { RootState } from "../../..";

export const selectCurrentUser = (state: RootState) => state.auth.user;
