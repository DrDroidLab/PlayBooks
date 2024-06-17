/* eslint-disable react-hooks/exhaustive-deps */
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { useDispatch, useSelector } from "react-redux";
import {
  addParentIndex,
  stepsSelector,
} from "../../../store/features/playbook/playbookSlice.ts";
import { useCallback, useEffect } from "react";
import CustomNode from "./CustomNode.jsx";
import { useReactFlow } from "reactflow";
import ParentNode from "./ParentNode.jsx";
import fetchGraphData from "../../../utils/graph/fetchGraphData.ts";
import useDagre from "../../../hooks/useDagre.ts";
import CustomEdge from "./CustomEdge.jsx";
import usePlaybookKey from "../../../hooks/usePlaybookKey.ts";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";

const nodeTypes = {
  custom: CustomNode,
  parent: ParentNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const CreateFlow = () => {
  const { permanentView } = usePermanentDrawerState();
  const [playbookEdges, setPlaybookEdges] = usePlaybookKey("playbookEdges");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const graphData = fetchGraphData();
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphData.edges ?? []);
  const steps = useSelector(stepsSelector);
  const reactFlowInstance = useReactFlow();
  const dagreData = useDagre(graphData);
  const dispatch = useDispatch();

  const onConnect = useCallback(
    ({ source, target }) => {
      return setEdges((eds) =>
        nodes
          .filter((node) => node.id === source || node.selected)
          .reduce((eds, node) => {
            const stepIndex = target.split("-")[1];
            const parentIndex = node.id.split("-")[1];
            dispatch(addParentIndex({ index: stepIndex, parentIndex }));
            return addEdge({ source: node.id, target }, eds);
          }, eds),
      );
    },
    [nodes],
  );

  useEffect(() => {
    setNodes(
      dagreData.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
        },
      })),
    );
    setEdges(dagreData.edges);
    reactFlowInstance.fitView();
  }, [steps]);

  useEffect(() => {
    reactFlowInstance.fitView();
  }, [permanentView]);

  const handleEdges = () => {
    if (playbookEdges?.length === 0) return edges;
    const lastEdge = edges[edges.length - 1];
    const newEdges = structuredClone(playbookEdges ?? []);
    if (!lastEdge) return playbookEdges;
    newEdges.push({
      source: lastEdge.source,
      target: lastEdge.target,
    });

    return newEdges;
  };

  useEffect(() => {
    setPlaybookEdges(handleEdges());
  }, [edges]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={-Infinity}
        fitView
        maxZoom={0.75}
        fitViewOptions={{ maxZoom: 0.75 }}
        onConnect={onConnect}
        className="bg-gray-50">
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default CreateFlow;
