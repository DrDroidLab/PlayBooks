export type SecretsInitialState = {
  id?: string;
  key: string;
  value: string;
  description: string;
};

export const secretsInitialState: SecretsInitialState = {
  key: "",
  description: "",
  value: "",
};
