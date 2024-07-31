import { RootState } from "../../..";

export const permanentViewSelector = (state: RootState) =>
  state.drawers.permanentView;
