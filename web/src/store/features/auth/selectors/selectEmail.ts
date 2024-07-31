import { RootState } from "../../..";

export const selectEmail = (state: RootState) => state.auth.email;
