import React from "react";
import { renderTimestamp } from "../../../utils/DateUtils";
import HandleOutput from "../steps/HandleOutput";

function StepConfig({ step, index, handleShowConfig }) {
  return (
    <div className="border rounded p-1 bg-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex flex-col px-1">
          <h2 className="text-violet-500 text-sm font-bold">Step</h2>
          <div className="flex gap-2 items-center flex-wrap">
            <h1 className="font-semibold text-lg line-clamp-3">
              {step.description}
            </h1>
            <div onClick={() => handleShowConfig(step.id)}>
              (
              <span className="text-violet-500 cursor-pointer hover:underline">
                Config
              </span>
              )
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <h2 className="text-violet-500 text-sm font-bold">Executed At</h2>
          <p className="text-gray-500 italic text-sm">
            {step?.outputs?.data?.length > 0
              ? renderTimestamp(step?.outputs?.data?.[0]?.timestamp)
              : ""}
          </p>
        </div>
      </div>
      <HandleOutput index={index} stepData={step} showHeading={false} />
    </div>
  );
}

export default StepConfig;
