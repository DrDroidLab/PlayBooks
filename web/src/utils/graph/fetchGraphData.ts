import { getNodes } from "./getNodes.ts";
import { getEdges } from "./getEdges.ts";

export type GraphData = {
  nodes: any[];
  edges: any[];
};

export default function fetchGraphData() {
  const nodes = getNodes();
  const edges = getEdges();

  console.log("nodes", nodes);

  return {
    nodes,
    edges,
  };
}
