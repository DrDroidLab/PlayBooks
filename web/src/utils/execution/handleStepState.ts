import getCurrentTask from "../getCurrentTask.ts";
import handleErrorMessage from "../playbook/handleErrorMessage.ts";
import { StepStateType, StepStates } from "./StepStates.ts";

function handleStepState(stepId: string) {
  const [step] = getCurrentTask(stepId);

  const isLoading = step.outputLoading;
  const hasError =
    !isLoading &&
    (step.outputError || Object.keys(step?.errors ?? {}).length > 0);

  const errorMessage: React.ReactNode = handleErrorMessage(stepId);

  const hasSuccess =
    !isLoading &&
    !hasError &&
    !step.outputLoading &&
    step.showOutput &&
    step?.outputs?.data?.length > 0 &&
    step.outputs.data.filter((op: any) => op.result?.error).length === 0;

  let state: StepStateType = StepStates.DEFAULT;

  if (isLoading) {
    state = StepStates.LOADING;
  } else if (hasError) {
    state = StepStates.ERROR;
  } else if (hasSuccess) {
    state = StepStates.SUCCESS;
  } else {
    state = StepStates.ERROR;
  }

  return {
    state,
    errorMessage,
  };
}

export default handleStepState;
