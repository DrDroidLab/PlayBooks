import React from "react";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import HandleExternalLinksRender from "./HandleExternalLinksRender.tsx";
import ExternalLinksList from "../../common/ExternalLinksList/index.tsx";
import StepDetailsButtons from "./StepDetailsButtons.tsx";

type StepProps = {
  id: string;
};

function Step({ id }: StepProps) {
  const [step, currentStepId] = useCurrentStep(id);

  if (!step) {
    return <p className="text-sm font-semibold">No Step found</p>;
  }

  return (
    <div className="p-1">
      <ExternalLinksList id={currentStepId} />
      <HandleExternalLinksRender id={currentStepId} />
      <StepDetailsButtons id={currentStepId} />
    </div>
  );
}

export default Step;
