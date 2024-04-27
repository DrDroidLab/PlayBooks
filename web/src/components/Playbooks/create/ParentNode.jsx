import React from 'react';
import { Handle, Position } from 'reactflow';

export default function ParentNode({ data }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 w-[200px] h-48">
      <div className="flex flex-col">
        <p className="text-lg font-bold z-10 mt-5">Playbook</p>
        <p className="text-sm text-gray-500 z-10 mt-5 italic">Add Description</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-violet-500" />
    </div>
  );
}
