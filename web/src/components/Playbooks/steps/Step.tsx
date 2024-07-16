import React from "react";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import HandleExternalLinksRender from "./HandleExternalLinksRender.tsx";
import ExternalLinksList from "../../common/ExternalLinksList/index.tsx";
import StepDetailsButtons from "./StepDetailsButtons.tsx";
import { Task } from "../../../types/index.ts";
import HandleOutput from "../task/HandleOutput.tsx";
import HandleNotesRender from "./HandleNotesRender.tsx";

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
      <HandleNotesRender id={currentStepId} />
      <StepDetailsButtons id={currentStepId} />

      <div className="flex flex-col gap-1 mt-4">
        {step.ui_requirement.showOutput && (
          <p className={"text-sm my-1 text-violet-500"}>
            <b>Output</b>
          </p>
        )}
        {step.tasks?.map((task: Task | string) => (
          <HandleOutput
            id={typeof task === "string" ? task : task.id}
            showHeading={false}
          />
        ))}
      </div>
    </div>
  );
}

export default Step;
