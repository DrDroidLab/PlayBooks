import React from "react";
import getCurrentTask from "../getCurrentTask.ts";

function handleErrorMessage(stepId: string): React.ReactNode | undefined {
  const [step] = getCurrentTask(stepId);
  if (step.outputError) {
    return <p>{step.outputError}</p>;
  }

  const errorKeys = Object.keys(step?.errors ?? {});
  if (errorKeys.length === 0) return undefined;

  return errorKeys.map((key) => <p>{step.errors[key].message}</p>);
}

export default handleErrorMessage;
