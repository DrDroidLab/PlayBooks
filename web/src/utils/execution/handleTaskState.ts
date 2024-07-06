import getCurrentTask from "../getCurrentTask.ts";
import handleErrorMessage from "../playbook/handleErrorMessage.tsx";
import { StepStateType, StepStates } from "./StepStates.ts";

function handleTaskState(taskId: string, log?: any) {
  const [task] = getCurrentTask(taskId);

  if (!task) {
    return {
      state: StepStates.DEFAULT,
      errorMessage: undefined,
    };
  }

  const isLoading = task.ui_requirement.outputLoading;
  const hasError =
    !isLoading &&
    (task.ui_requirement.outputError ||
      Object.keys(task.ui_requirement?.errors ?? {}).length > 0);

  const errorMessage: React.ReactNode = handleErrorMessage(taskId);

  const hasSuccess =
    !isLoading &&
    !hasError &&
    !task.ui_requirement.outputLoading &&
    task.ui_requirement.showOutput &&
    !task.ui_requirement?.output?.result?.error;

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

export default handleTaskState;
