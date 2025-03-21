import { secretsInitialState, SecretsInitialState } from "../initialState";

export const resetSecretStateAction = (state: SecretsInitialState) => {
  Object.assign(state, secretsInitialState);
};
