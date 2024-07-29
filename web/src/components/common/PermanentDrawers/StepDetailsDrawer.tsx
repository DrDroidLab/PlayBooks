import { CircularProgress } from "@mui/material";
import { useEffect, useRef } from "react";
import React from "react";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import updateStepById from "../../../utils/playbook/step/updateStepById.ts";
import Step from "../../Playbooks/steps/Step.tsx";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";
import useIsPrefetched from "../../../hooks/playbooks/useIsPrefetched.ts";

function StepDetailsDrawer() {
  const [step, currentStepId] = useCurrentStep();
  const stepRef = useRef<HTMLDivElement>(null);
  const isPrefetched = useIsPrefetched();

  const handleUpdateStepName = (val: string) => {
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

      <CustomInput
        inputType={InputTypes.TEXT}
        value={step?.description ?? ""}
        handleChange={handleUpdateStepName}
        disabled={!!isPrefetched}
        className="!w-full"
        containerClassName="w-full"
        placeholder="Enter step name"
      />

      {currentStepId && <Step id={currentStepId} />}
    </div>
  );
}

export default StepDetailsDrawer;
