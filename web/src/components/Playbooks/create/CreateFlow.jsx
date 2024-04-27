/* eslint-disable react-hooks/exhaustive-deps */
import ReactFlow, { Background, Controls, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { useSelector } from 'react-redux';
import { stepsSelector } from '../../../store/features/playbook/playbookSlice.ts';
import { useEffect } from 'react';
import CustomNode from './CustomNode.jsx';
import { useReactFlow } from 'reactflow';
import ParentNode from './ParentNode.jsx';

const nodeTypes = {
  custom: CustomNode,
  parent: ParentNode
};

const initialPlaybookNode = {
  id: 'playbook',
  position: { x: 0, y: 0 },
  data: {
    label: 'Playbook',
    index: 0
  },
  type: 'parent'
};

const CreateFlow = () => {
  const steps = useSelector(stepsSelector);
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([initialPlaybookNode]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const stepNodes = steps.map((step, index) => {
    return {
      id: `node-${index}`,
      position: {
        x: -(250 * (steps.length / 2 + 1 / 2)) + 250 * (index + 1),
        y: 300
      },
      data: {
        step,
        index
      },
      type: 'custom'
    };
  });

  const stepEdges = steps.map((_, index) => {
    return { id: `edge-${index}`, source: `playbook`, target: `node-${index}` };
  });

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
        className="bg-gray-50"
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default CreateFlow;
