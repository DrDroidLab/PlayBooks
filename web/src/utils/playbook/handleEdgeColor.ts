import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import { store } from "../../store/index.ts";
import { StepStates } from "../execution/StepStates.ts";
import handleStepState from "../execution/handleStepState.ts";
import { extractParent, extractSource } from "../extractData.ts";
import getCurrentTask from "../getCurrentTask.ts";
import { extractLogs } from "./extractLogs.ts";

function handleEdgeColor(edgeId: string) {
  const state = store.getState();
  const additonalState = additionalStateSelector(state);
  const { id } = additonalState;
  const sourceId = extractSource(edgeId);
  const parentId = extractParent(edgeId);
  const [childStep] = getCurrentTask(sourceId);
  const logs = childStep?.id ? extractLogs(childStep.id, parentId) : [];
  const log = logs?.length > 0 ? logs[0] : null;

  if (id === edgeId) {
    return "rgba(139, 92, 246, 1)";
  }

  const { state: stepState } = handleStepState(parentId, log);

  switch (stepState) {
    case StepStates.SUCCESS:
      return "green";
    case StepStates.ERROR:
      return "red";
    default:
      return undefined;
  }
}

export default handleEdgeColor;
