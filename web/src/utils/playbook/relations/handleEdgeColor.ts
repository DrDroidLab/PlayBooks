import { additionalStateSelector } from "../../../store/features/drawers/drawersSlice.ts";
import { store } from "../../../store/index.ts";
import {
  RelationStates,
  RelationStateType,
} from "../../execution/RelationStates.ts";
import handleStepRelationState from "../../execution/handleStepRelationState.ts";
import getCurrentRelation from "./getCurrentRelation.ts";

function handleEdgeColor(edgeId: string) {
  const state = store.getState();
  const additonalState = additionalStateSelector(state);
  const { id } = additonalState;
  const [relation] = getCurrentRelation(edgeId);
  let relationState: RelationStateType = RelationStates.DEFAULT;

  if (id === edgeId) {
    relationState = RelationStates.SELECTED;
  }

  relationState = relation
    ? handleStepRelationState(relation)
    : RelationStates.DEFAULT;

  switch (relationState) {
    case RelationStates.SUCCESS:
      return "green";
    case RelationStates.ERROR:
      return "red";
    case RelationStates.SELECTED:
      return "rgba(139, 92, 246, 1)";
    default:
      return undefined;
  }
}

export default handleEdgeColor;
