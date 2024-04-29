import React from "react";
import { Handle, Position } from "reactflow";
import { useDispatch } from "react-redux";
import { setCurrentStepIndex } from "../../../store/features/playbook/playbookSlice.ts";
import { cardsData } from "../../../utils/cardsData.js";

export default function CustomNode({ data }) {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(setCurrentStepIndex(data.index));
  };

  return (
    <div
      className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 w-[200px] h-48 cursor-pointer  transition-all hover:shadow-violet-500"
      onClick={handleClick}>
      <div className="flex flex-col items-center gap-4">
        {/* <img
          className="w-10 h-10"
          src={
            cardsData.find(
              (e) => e.enum === data?.step?.source.replace("_VPC", ""),
            )?.url ?? ""
          }
          alt="logo"
        /> */}
        <p className="text-lg font-bold text-center z-10">
          {data?.step?.description ||
            data?.step?.selectedSource ||
            `Step - ${data?.index + 1}`}
        </p>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-violet-500"
      />
    </div>
  );
}
