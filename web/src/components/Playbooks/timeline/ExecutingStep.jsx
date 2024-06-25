import { CircularProgress } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { stepsSelector } from "../../../store/features/playbook/playbookSlice.ts";

function ExecutingStep({ handleShowConfig }) {
  const playbookSteps = useSelector(stepsSelector);
  const executingStep = (playbookSteps ?? []).find(
    (step) => step.outputLoading,
  );

  if (Object.keys(executingStep ?? {}).length === 0) return <></>;

  return (
    <div className="border rounded p-3 bg-gray-100 mt-2">
      <h2 className="text-violet-500 text-sm font-bold">Step</h2>
      <div className="flex gap-2 items-center flex-wrap">
        <h1 className="font-semibold text-lg line-clamp-3">
          {executingStep.description}
        </h1>
        {/* <div onClick={() => handleShowConfig(executingStep.id)}>
          (
          <span className="text-violet-500 cursor-pointer hover:underline">
            Show Config
          </span>
          )
        </div> */}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <CircularProgress size={20} />
        <div className="text-sm">Step execution is in progess</div>
      </div>
    </div>
  );
}

export default ExecutingStep;
