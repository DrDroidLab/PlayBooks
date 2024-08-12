import { DynamicAlertType } from "../../../../types";

export const resetDynamicAlertState = (state: DynamicAlertType) => {
  state.name = "";
  state.id = undefined;
  state.evaluationWindowInMinutes = undefined;
};
