import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import { store } from "../../store/index.ts";
import extractSource from "../extractSource.ts";
import getCurrentTask from "../getCurrentTask.ts";

function handleEdgeColor(edgeId: string) {
  const state = store.getState();
  const additonalState = additionalStateSelector(state);
  const { id } = additonalState;
  const sourceId = extractSource(edgeId);
  const [childStep] = getCurrentTask(sourceId);

  if (id === edgeId) {
    return "rgba(139, 92, 246, 1)";
  }

  if (childStep?.outputs?.data?.length > 0) {
    return "green";
  }

  if (childStep?.outputError) {
    return "red";
  }
}

export default handleEdgeColor;
