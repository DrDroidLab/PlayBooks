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
import { useCallback, useEffect, useState } from "react";
import CustomNode from "./CustomNode.jsx";
import { useReactFlow } from "reactflow";
import ParentNode from "./ParentNode.jsx";
import CustomDrawer from "../../common/CustomDrawer/index.jsx";
import Sidebar from "./Sidebar.jsx";
import fetchGraphData from "../../../utils/graph/fetchGraphData.ts";
import useDagre from "../../../hooks/useDagre.ts";

const nodeTypes = {
  custom: CustomNode,
  parent: ParentNode,
};

const CreateFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const graphData = fetchGraphData();
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphData.edges ?? []);
  const [addDataDrawerOpen, setAddDataDrawerOpen] = useState(false);
  const [parentIndex, setParentIndex] = useState(null);
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
          setAddDataDrawerOpen,
          setParentIndex,
        },
      })),
    );
    setEdges(dagreData.edges);
    reactFlowInstance.fitView();
  }, [steps]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        minZoom={-Infinity}
        fitView
        maxZoom={0.75}
        fitViewOptions={{ maxZoom: 0.75 }}
        onConnect={onConnect}
        className="bg-gray-50">
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      <CustomDrawer
        isOpen={addDataDrawerOpen}
        setIsOpen={setAddDataDrawerOpen}
        openFrom="left"
        addtionalStyles={"lg:w-[20%]"}
        showOverlay={false}
        startFrom="80">
        <div className="flex-[0.4] border-r-[1px] border-r-gray-200 h-full">
          <Sidebar
            parentIndex={parentIndex}
            setParentIndex={setParentIndex}
            setIsOpen={setAddDataDrawerOpen}
          />
        </div>
      </CustomDrawer>
    </div>
  );
};

export default CreateFlow;
