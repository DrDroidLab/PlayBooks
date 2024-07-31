/* eslint-disable react-hooks/exhaustive-deps */
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { useEffect } from "react";
import { useReactFlow } from "reactflow";
import CustomEdge from "./CustomEdge.js";
import StepNode from "./nodes/StepNode.tsx";
import handleEdgesDelete from "./utils/handleEdgesDelete.ts";
import handleConnection from "./utils/handleConnection.ts";
import useDimensions from "../../../hooks/playbooks/useDimensions.ts";
import useGraphDimensions from "../../../hooks/playbooks/useGraphDimensions.ts";

const fitViewOptions = {
  maxZoom: 0.75,
  duration: 500,
};

const nodeTypes = {
  step: StepNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const CreateFlow = () => {
  const reactFlowInstance = useReactFlow();
  const [graphRef, { width, height }] = useDimensions();
  const { graphData, dagreData } = useGraphDimensions(
    width,
    height,
    reactFlowInstance,
  );
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphData.edges ?? []);

  useEffect(() => {
    if (dagreData?.nodes?.length > 0) {
      setNodes(dagreData?.nodes);
    }
    if (dagreData?.edges?.length > 0) {
      setEdges(dagreData.edges);
    }
  }, [dagreData]);

  return (
    <div ref={graphRef} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={handleEdgesDelete}
        onConnect={handleConnection}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes as any}
        minZoom={-Infinity}
        maxZoom={1}
        zoomOnScroll={true}
        zoomOnPinch={true}
        fitView
        fitViewOptions={fitViewOptions}
        edgesUpdatable={false}
        className="bg-gray-50">
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default CreateFlow;
