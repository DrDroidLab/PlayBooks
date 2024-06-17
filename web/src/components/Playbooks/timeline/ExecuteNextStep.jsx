import React from "react";
import { executeStep } from "../../../utils/execution/executeStep.ts";
import { useSelector } from "react-redux";
import { stepsSelector } from "../../../store/features/playbook/playbookSlice.ts";
import CustomButton from "../../common/CustomButton/index.tsx";
import { PlayArrowRounded } from "@mui/icons-material";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";

function ExecuteNextStep({ handleShowConfig, stepIndex }) {
  const playbookSteps = useSelector(stepsSelector);
  const [step, index] = useCurrentStep(stepIndex + 1);

  const handleExecuteNextStep = () => {
    executeStep(playbookSteps[index], index);
  };

  if (Object.keys(step ?? {}).length === 0) return <></>;

  return (
    <div className="border rounded p-3 bg-gray-100 mt-2">
      <h2 className="text-violet-500 text-sm font-bold">Next Step</h2>
      <div className="flex gap-2 items-center flex-wrap">
        <h1 className="font-semibold text-lg line-clamp-3">
          {step?.description}
        </h1>
        <div onClick={() => handleShowConfig(step?.id)}>
          {/* (
          <span className="text-violet-500 cursor-pointer hover:underline">
            Show Config
          </span>
          ) */}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <CustomButton onClick={handleExecuteNextStep}>
          <PlayArrowRounded /> Execute
        </CustomButton>
      </div>
    </div>
  );
}

export default ExecuteNextStep;
