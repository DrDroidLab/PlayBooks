import { MarkerType } from "reactflow";
import { Step } from "../../types.ts";
import { parentIndexExists } from "../parentIndexesExist.ts";

export const getEdges = (steps: Step[]) => {
  const stepsWithParents = steps.filter((step) =>
    parentIndexExists(step.parentIndexes),
  );
  const stepsWithoutParents = steps.filter(
    (step) => !parentIndexExists(step.parentIndexes),
  );

  const stepsWithoutParentsEdges = stepsWithoutParents.map((step, index) => ({
    id: `edge-${step.stepIndex}`,
    source: `playbook`,
    target: `node-${step.stepIndex}`,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }));
  const stepsWithParentsEdges = stepsWithParents.flatMap((step) =>
    step?.parentIndexes?.map((parentIndex) => ({
      id: `edge-${parentIndex}-${step.stepIndex}`, // Ensures unique edge id
      source: `node-${parentIndex}`,
      target: `node-${step.stepIndex}`,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      type: "custom",
    })),
  );

  const stepEdges = [...stepsWithoutParentsEdges, ...stepsWithParentsEdges];
  return stepEdges;
};
