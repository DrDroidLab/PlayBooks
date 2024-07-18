import React from "react";
import { Step } from "../../../types/index.ts";
import RunStepButton from "../../Buttons/RunStepButton/index.tsx";

type StepTitleProps = {
  step: Step;
};

function StepTitle({ step }: StepTitleProps) {
  return (
    <div className="flex gap-1 items-center justify-between w-full">
      <p className="font-bold text-violet-500 text-base overflow-hidden text-ellipsis line-clamp-2">
        {step.description}
      </p>
      <RunStepButton id={step.id} />
    </div>
  );
}

export default StepTitle;
