import { Step, StepRelation, StepRelationContract } from "../../types/index.ts";

function dfsStep(step: Step, visited: Set<string>, result: string[]): void {
  if (!visited.has(step.id)) {
    visited.add(step.id);
    result.push(step.id);
  }
}

export default function constructDfs(
  relations: (StepRelation | StepRelationContract)[],
): string[] {
  const visited = new Set<string>();
  const result: string[] = [];

  for (const relation of relations) {
    dfsStep(relation.parent as Step, visited, result);
    dfsStep(relation.child as Step, visited, result);
  }

  return result;
}
