import React from "react";
import { Step } from "../../../types/index.ts";

type StepTitleProps = {
  step: Step;
};

function StepTitle({ step }: StepTitleProps) {
  return (
    <div className="flex gap-1 items-center max-w-[250px]">
      <p className="font-bold text-violet-500 text-base overflow-hidden text-ellipsis line-clamp-2">
        {step.description}
      </p>
    </div>
  );
}

export default StepTitle;
