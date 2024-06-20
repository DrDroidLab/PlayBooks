import { CircularProgress } from "@mui/material";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import Step from "../steps/Step.jsx";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import { updateCardById } from "../../../utils/execution/updateCardById.ts";

function StepDetails() {
  const [step, currentStepId] = useCurrentStep();
  const isPrefetched = useIsPrefetched();

  const handleUpdateStepName = (e) => {
    const val = e.target.value;
    updateCardById("description", e.target.value, currentStepId);
    if (val.trim())
      updateCardById("userEnteredDescription", true, currentStepId);
  };

  if (!Object.keys(step).length === 0) return <>No Step Found</>;

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
            onChange={handleUpdateStepName}
            disabled={isPrefetched}
          />
        </div>
      </div>
      {currentStepId && <Step id={currentStepId} />}
    </div>
  );
}

export default StepDetails;
