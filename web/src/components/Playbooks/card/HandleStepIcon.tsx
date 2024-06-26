import { CheckCircleOutline, ErrorOutline } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import React from "react";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";

function HandleStepIcon({ stepId }) {
  const [step] = useCurrentStep(stepId);

  return (
    <div>
      {(step.outputLoading || step.inprogress) && (
        <CircularProgress size={20} />
      )}
      {(step.outputError || Object.keys(step?.errors ?? {}).length > 0) && (
        <ErrorOutline color="error" fontSize="medium" />
      )}
      {!step.outputError &&
        !step.outputLoading &&
        step.showOutput &&
        step.outputs?.data?.length > 0 &&
        Object.keys(step?.errors ?? {}).length === 0 && (
          <CheckCircleOutline color="success" fontSize="medium" />
        )}
    </div>
  );
}

export default HandleStepIcon;
