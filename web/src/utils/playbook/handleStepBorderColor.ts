import { StepStates } from "../execution/StepStates.ts";
import handleStepState from "../execution/handleStepState.ts";

function handleStepBorderColor(stepId: string) {
  const state = handleStepState(stepId);

  switch (state) {
    case StepStates.SUCCESS:
      return "green";
    case StepStates.ERROR:
      return "red";
    default:
      return undefined;
  }
}

export default handleStepBorderColor;
