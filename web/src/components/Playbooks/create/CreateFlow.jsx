/* eslint-disable react-hooks/exhaustive-deps */
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { useSelector } from "react-redux";
import { stepsSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { useEffect, useState } from "react";
import CustomNode from "./CustomNode.jsx";
import { useReactFlow } from "reactflow";
import ParentNode from "./ParentNode.jsx";
import CustomDrawer from "../../common/CustomDrawer/index.jsx";
import Sidebar from "./Sidebar.jsx";

const parentIndexExists = (parentIndexes) => {
  return parentIndexes && parentIndexes?.length > 0;
};

const nodeTypes = {
  custom: CustomNode,
  parent: ParentNode,
};

const initialPlaybookNode = {
  id: "playbook",
  position: { x: 0, y: 0 },
  data: {
    label: "Playbook",
    index: 0,
  },
  type: "parent",
};

const CreateFlow = () => {
  const [addDataDrawerOpen, setAddDataDrawerOpen] = useState(false);
  const [parentIndex, setParentIndex] = useState(null);

  const steps = useSelector(stepsSelector);
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([initialPlaybookNode]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const stepsWithParents = steps.filter((step) =>
    parentIndexExists(step.parentIndexes),
  );
  const stepsWithoutParents = steps.filter(
    (step) => !parentIndexExists(step.parentIndexes),
  );

  const stepNodes = steps.map((step, index) => {
    return {
      id: `node-${step.stepIndex}`,
      position: {
        x: step.position.x,
        y: step.position.y,
      },
      data: {
        step,
        index,
        setAddDataDrawerOpen,
        setParentIndex,
      },
      type: "custom",
    };
  });

  const stepsWithoutParentsEdges = stepsWithoutParents.map((step, index) => ({
    id: `edge-${step.stepIndex}`,
    source: `playbook`,
    target: `node-${index}`,
  }));
  const stepsWithParentsEdges = stepsWithParents.flatMap((step) =>
    step.parentIndexes.map((parentIndex) => ({
      id: `edge-${parentIndex}-${step.stepIndex}`, // Ensures unique edge id
      source: `node-${parentIndex}`,
      target: `node-${step.stepIndex}`,
    })),
  );

  const stepEdges = [...stepsWithoutParentsEdges, ...stepsWithParentsEdges];

  useEffect(() => {
    setNodes([...stepNodes, initialPlaybookNode]);
    setEdges(stepEdges);
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
