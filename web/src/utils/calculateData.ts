import { graphlib, layout } from "@dagrejs/dagre";
import { GraphData } from "./graph/fetchGraphData.ts";

export const calculateData = (
  graphData: GraphData,
  width: number,
  height: number,
) => {
  const { nodes, edges } = graphData;

  const g = new graphlib.Graph();
  g.setGraph({});

  g.setDefaultEdgeLabel(function () {
    return {};
  });

  nodes.forEach((node) => {
    g.setNode(node.id, {
      label: node.id,
      width: 350,
      height: node.type === "custom" ? 450 : 200,
    });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  layout(g, {
    align: "center",
    width,
    height,
  });

  const graphNodes = g
    .nodes()
    .map((node) => {
      const graphNode = g.node(node);
      const newNode = nodes.find((e) => e.id === node);
      if (!newNode) return undefined;
      newNode.position.x = graphNode.x;
      newNode.position.y = graphNode.y;

      return newNode;
    })
    .filter((e) => e !== undefined);

  return { nodes: graphNodes, edges };
};
