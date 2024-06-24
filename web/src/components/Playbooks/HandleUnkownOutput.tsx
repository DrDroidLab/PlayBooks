import React from "react";
import useCurrentStep from "../../hooks/useCurrentStep.ts";
import { SOURCES } from "../../constants/index.ts";
import PlayBookRunMetricGraph from "./PlayBookRunMetricGraph";
import HandleDocumentationOutputs from "./outputs/HandleDocumentationOutputs.tsx";

function HandleUnkownOutput({ stepId, error, showHeading }) {
  const [step] = useCurrentStep(stepId);

  if (showHeading) {
    return <p className="text-sm font-semibold">No output available</p>;
  }

  switch (step.source) {
    case SOURCES.TEXT:
      return <HandleDocumentationOutputs stepId={stepId} />;
    default:
      return (
        <PlayBookRunMetricGraph
          error={error}
          title={
            error ? "Error from Source" : "No data available for this step"
          }
          result={null}
          timestamp={null}
        />
      );
  }
}

export default HandleUnkownOutput;
