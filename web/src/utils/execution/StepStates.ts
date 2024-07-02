export const StepStates = {
  LOADING: "LOADING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
  DEFAULT: "DEFAULT",
} as const;

export type StepStateType = (typeof StepStates)[keyof typeof StepStates];
