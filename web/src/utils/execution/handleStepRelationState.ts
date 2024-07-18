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

  switch(evaluationResult) {
    case true:
      state = RelationStates.SUCCESS;
      break;
    case false:
    state = RelationStates.ERROR;
    break;
    default: 
    state = RelationStates.DEFAULT;
  }


  return state;
}

export default handleStepRelationState;
