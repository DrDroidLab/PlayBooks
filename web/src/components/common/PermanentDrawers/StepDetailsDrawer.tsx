import { CircularProgress } from "@mui/material";
import { useEffect, useRef } from "react";
import React from "react";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import updateStepById from "../../../utils/playbook/step/updateStepById.ts";

function StepDetailsDrawer() {
  const [step, currentStepId] = useCurrentStep();
  const stepRef = useRef<HTMLDivElement>(null);

  const handleUpdateStepName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateStepById("description", val, currentStepId!);
  };

  useEffect(() => {
    stepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepRef, currentStepId]);

  if (Object.keys(step ?? {}).length === 0) return <>No Step Found</>;

  return (
    <div ref={stepRef} className="p-2 min-h-screen mb-16">
      <h2 className="font-bold mb-2 flex items-center gap-2 justify-between mr-2">
        Title{" "}
        {step?.ui_requirement?.outputLoading && <CircularProgress size={20} />}
      </h2>

      <div className="flex items-center justify-between pr-2">
        <div className="w-full">
          <input
            className="border-gray-300 border rounded w-full p-1 text-sm font-bold text-gray-500"
            value={step?.description}
            onChange={handleUpdateStepName}
          />
        </div>
      </div>
    </div>
  );
}

export default StepDetailsDrawer;
