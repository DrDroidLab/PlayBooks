import { PayloadAction } from "@reduxjs/toolkit";
import { DynamicAlertType } from "../../../../types";

export const setDynamicAlert = (
  state: DynamicAlertType,
  action: PayloadAction<any>,
) => {
  state.name = action.payload.name;
  state.id = action.payload.id;
};
