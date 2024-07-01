import React from "react";
import { useSelector } from "react-redux";
import { Handle, Position } from "reactflow";
import { currentPlaybookSelector } from "../../../store/features/playbook/playbookSlice.ts";

export default function ParentNode() {
  const playbook = useSelector(currentPlaybookSelector);

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 w-[200px] max-h-[100px] text-ellipsis overflow-hidden">
      <div className="flex flex-col">
        <p className="text-lg font-bold z-10 line-clamp-4 text-violet-500">
          {playbook?.name || "Untitled Playbook"}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-violet-500"
      />
    </div>
  );
}
