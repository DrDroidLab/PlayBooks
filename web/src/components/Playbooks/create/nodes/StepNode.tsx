import React from "react";
import { Step } from "../../../../types/index.ts";

function StepNode({ data }) {
  const step: Step = data.step;
  return <div>StepNode: {step.id}</div>;
}

export default StepNode;
