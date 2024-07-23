export const RelationStates = {
  SELECTED: "SELECTED",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
  DEFAULT: "DEFAULT",
} as const;

export type RelationStateType =
  (typeof RelationStates)[keyof typeof RelationStates];
