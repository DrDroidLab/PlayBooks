import { PayloadAction } from "@reduxjs/toolkit";
import { DynamicAlertType } from "../../../../types";

export const setDynamicAlert = (
  state: DynamicAlertType,
  action: PayloadAction<any>,
) => {
  state.name = action.payload.name;
  state.id = action.payload.id;
  state.evaluationWindowInMinutes = action.payload.configuration
    ?.evaluation_window_in_seconds
    ? action.payload.configuration.evaluation_window_in_seconds / 60
    : undefined;
};
