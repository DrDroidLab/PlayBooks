import { getNodes } from "./getNodes.ts";
import { getEdges } from "./getEdges.ts";
import { currentPlaybookSelector } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";

export type GraphData = {
  nodes: any[];
  edges: any[];
};

export default function fetchGraphData() {
  const playbook = currentPlaybookSelector(store.getState());
  const nodes = [];
  const edges = getEdges();

  return {
    nodes,
    edges,
  };
}
