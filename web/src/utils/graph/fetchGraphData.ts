import { getNodes } from "./getNodes.ts";
import { getEdges } from "./getEdges.ts";
import { Step } from "../../types.ts";

export type GraphData = {
  nodes: any[];
  edges: any[];
};

export default function fetchGraphData(steps: Step[]) {
  const nodes = getNodes(steps);
  const edges = getEdges(steps);

  return {
    nodes,
    edges,
  };
}
