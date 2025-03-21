import { PayloadAction } from "@reduxjs/toolkit";
import { secretsInitialState, SecretsInitialState } from "../initialState";

type PayloadType = {
  key: keyof SecretsInitialState;
  value: (typeof secretsInitialState)[keyof SecretsInitialState];
};

export const setSecretKeyAction = (
  state: SecretsInitialState,
  { payload }: PayloadAction<PayloadType>,
) => {
  const { key, value } = payload;

  state[key] = value as any;
};
