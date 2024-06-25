import React from "react";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import { taskTypes } from "../../../constants/taskTypes.ts";
import IframeRender from "../options/IframeRender.tsx";
import Notes from "../steps/Notes.jsx";

function HandleDocumentationOutputs({ stepId }) {
  const [step] = useCurrentStep(stepId);
  console.log("step", step);
  const type = `${step.source} ${step.taskType}`;

  switch (type) {
    case taskTypes.DOCUMENTATION_IFRAME:
      return <IframeRender url={step.iframe_url} />;
    case taskTypes.DOCUMENTATION_MARKDOWN:
      return <Notes id={stepId} />;
    default:
      return <></>;
  }
}

export default HandleDocumentationOutputs;
