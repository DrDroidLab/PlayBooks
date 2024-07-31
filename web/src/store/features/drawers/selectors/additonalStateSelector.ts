import { RootState } from "../../..";

export const additionalStateSelector = (state: RootState) =>
  state.drawers.additionalState;
