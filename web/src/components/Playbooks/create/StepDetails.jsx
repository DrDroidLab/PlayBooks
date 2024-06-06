/* eslint-disable react-hooks/exhaustive-deps */
import { useSelector } from "react-redux";
import {
  playbookSelector,
  stepsSelector,
} from "../../../store/features/playbook/playbookSlice.ts";
import { CircularProgress } from "@mui/material";
import { updateCardByIndex } from "../../../utils/execution/updateCardByIndex.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import Step from "../steps/Step.jsx";

function StepDetails() {
  const steps = useSelector(stepsSelector);
  const { currentStepIndex } = useSelector(playbookSelector);
  const step = steps[currentStepIndex];
  const isPrefetched = useIsPrefetched();

  if (!step) return <></>;

  return (
    <div className="p-2 min-h-screen mb-16">
      <h2 className="font-bold mb-2 flex items-center gap-2 justify-between mr-2">
        Title {step?.outputLoading && <CircularProgress size={20} />}
      </h2>

      <div className="flex items-center justify-between pr-2">
        <div className="w-full">
          <input
            className="border-gray-300 border rounded w-full p-1 text-sm font-bold text-gray-500"
            value={step.description}
            onChange={(e) => updateCardByIndex("description", e.target.value)}
            disabled={isPrefetched}
          />
        </div>
      </div>
      <Step step={step} index={currentStepIndex} />
    </div>
  );
}

export default StepDetails;
