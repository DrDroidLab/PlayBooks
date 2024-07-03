import { StepStates } from "../execution/StepStates.ts";
import handleStepState from "../execution/handleStepState.ts";
import { extractLogs } from "./extractLogs.ts";

function handleStepBorderColor(stepId: string) {
  const logs = extractLogs(stepId);
  const filteredLogs = logs.filter((log) => log.evaluation_result);
  const { state } = handleStepState(stepId, filteredLogs[0]);

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
