import { Edge } from "reactflow";

function handleEdgesDelete(edges: Edge[]): void {
  edges.forEach((edge) => console.log(edge.id));
  return;
}

export default handleEdgesDelete;
