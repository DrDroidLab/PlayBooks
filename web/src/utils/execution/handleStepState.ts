import getCurrentTask from "../getCurrentTask.ts";
import handleErrorMessage from "../playbook/handleErrorMessage.tsx";
import { StepStateType, StepStates } from "./StepStates.ts";

function handleStepState(stepId: string, log?: any) {
  const [step] = getCurrentTask(stepId);

  if (!step) {
    return {
      state: StepStates.DEFAULT,
      errorMessage: undefined,
    };
  }

  if (!step.showError) {
    return {
      state: StepStates.DEFAULT,
      errorMessage: undefined,
    };
  }

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

  if (log) {
    if (!log?.evaluation_result) {
      state = StepStates.ERROR;
    } else {
      state = StepStates.SUCCESS;
    }

    return {
      state,
      errorMessage,
    };
  }

  if (isLoading) {
    state = StepStates.LOADING;
  } else if (hasError) {
    state = StepStates.ERROR;
  } else if (hasSuccess) {
    state = StepStates.SUCCESS;
  } else {
    state = StepStates.DEFAULT;
  }

  return {
    state,
    errorMessage,
  };
}

export default handleStepState;
