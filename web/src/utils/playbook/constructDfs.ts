import { Step, StepRelation, StepRelationContract } from "../../types/index.ts";

function dfsStep(
  step: Step,
  visited: Set<string>,
  result: string[],
  relationsMap: Map<string, StepRelation | StepRelationContract>,
): void {
  if (!visited.has(step.id)) {
    visited.add(step.id);
    result.push(step.id);

    // Find the next relations where the current step is the parent
    for (const relation of relationsMap.values()) {
      const evaluationResult =
        relation.ui_requirement?.evaluation?.evaluation_result;
      if ((relation.parent as Step).id === step.id && evaluationResult) {
        dfsStep(relation.child as Step, visited, result, relationsMap);
      }
    }
  }
}

export default function constructDfs(
  relations: (StepRelation | StepRelationContract)[],
): string[] {
  const visited = new Set<string>();
  const result: string[] = [];
  const relationsMap = new Map<string, StepRelation | StepRelationContract>();

  // Populate the relations map
  for (const relation of relations) {
    relationsMap.set(relation.id, relation);
  }

  // Start DFS from each parent step in the relations
  for (const relation of relations) {
    dfsStep(relation.parent as Step, visited, result, relationsMap);
  }

  return result;
}
