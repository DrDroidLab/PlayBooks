import { PayloadAction } from "@reduxjs/toolkit";
import { DynamicAlertType } from "../../../../types";

export const setDynamicAlertKey = (
  state: DynamicAlertType,
  action: PayloadAction<{ key: keyof DynamicAlertType; value: any }>,
) => {
  const { key, value } = action.payload;

  state[key] = value;
};
