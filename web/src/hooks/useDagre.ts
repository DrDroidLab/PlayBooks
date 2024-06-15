import { graphlib, layout } from "@dagrejs/dagre";
import { GraphData } from "../utils/graph/fetchGraphData.ts";

function useDagre(graphData: GraphData) {
  var g = new graphlib.Graph();
  const { nodes, edges } = graphData;

  g.setGraph({});

  g.setDefaultEdgeLabel(function () {
    return {};
  });

  nodes.forEach((node) => {
    g.setNode(node.id, {
      label: node.id,
      width: 350,
      height: node.type === "custom" ? 400 : 200,
    });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  layout(g);

  const graphNodes = g.nodes().map((node) => {
    const graphNode = g.node(node);
    const newNode = nodes.find((e) => e.id === node);
    newNode.position.x = graphNode.x;
    newNode.position.y = graphNode.y;

    return newNode;
  });

  return {
    nodes: graphNodes,
    edges,
  };
}

export default useDagre;
