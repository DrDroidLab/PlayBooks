import {
  StepRelation,
  StepRelationContract,
} from "../../types/stepRelations.ts";
import { RelationStates, RelationStateType } from "./RelationStates.ts";
import { StepStates } from "./StepStates.ts";

function handleStepRelationState(
  relation: StepRelation | StepRelationContract,
): RelationStateType {
  let state: RelationStateType = StepStates.DEFAULT;
  const evaluationResult =
    relation.ui_requirement?.evaluation?.evaluation_result;

  if (evaluationResult) {
    state = RelationStates.SUCCESS;
  } else {
    state = RelationStates.ERROR;
  }

  return state;
}

export default handleStepRelationState;
