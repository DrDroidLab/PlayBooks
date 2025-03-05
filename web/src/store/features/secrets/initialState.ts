export const VariableOption = {
  DROPDOWN: "DROPDOWN",
} as const;

export type VariableOptionType =
  (typeof VariableOption)[keyof typeof VariableOption];

export type SecretsInitialState = {
  name: string;
  description: string;
  options: string;
  type: VariableOptionType;
};

export const secretsInitialState: SecretsInitialState = {
  name: "",
  description: "",
  options: "",
  type: VariableOption.DROPDOWN,
};
