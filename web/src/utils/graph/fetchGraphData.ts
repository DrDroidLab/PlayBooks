import { getNodes } from "./getNodes.ts";
import { getEdges } from "./getEdges.ts";
import { stepsSelector } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";

export type GraphData = {
  nodes: any[];
  edges: any[];
};

export default function fetchGraphData() {
  const steps = stepsSelector(store.getState());
  const nodes = getNodes(steps);
  const edges = getEdges(steps);

  return {
    nodes,
    edges,
  };
}
