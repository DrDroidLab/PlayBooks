import { secretsInitialState, SecretsInitialState } from "../initialState";

export const resetSecretStateAction = (state: SecretsInitialState) => {
  state.name = secretsInitialState.name;
  state.description = secretsInitialState.name;
  state.options = secretsInitialState.options;
  state.type = secretsInitialState.type;
};
