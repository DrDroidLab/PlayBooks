import React from "react";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import { cardsData } from "../../../utils/cardsData";
import HandleStepIcon from "./HandleStepIcon.tsx";
import StepButtons from "./StepButtons.tsx";

function StepTitle({ stepId, handleClick }) {
  const [step] = useCurrentStep(stepId);
  return (
    <div className="bg-gray-200 flex items-center justify-between p-2 w-[300px]">
      <div className="flex items-center gap-1">
        {step?.source && (
          <img
            className="w-8 h-8"
            src={cardsData.find((e) => e.enum === step?.source)?.url ?? ""}
            alt="logo"
          />
        )}
        <HandleStepIcon stepId={step.id} />
        <p className="text-sm font-semibold break-word line-clamp-2">
          {step.description}
        </p>
      </div>
      <StepButtons stepId={step.id} handleClick={handleClick} />
    </div>
  );
}

export default StepTitle;
