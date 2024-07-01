import { useGetPlaybookExecutionQuery } from "../../store/features/playbook/api/index.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  showTaskConfig,
  stepsSelector,
} from "../../store/features/playbook/playbookSlice.ts";
import Loading from "../common/Loading/index.tsx";
import ExecutingStep from "./timeline/ExecutingStep.jsx";
import StepConfig from "./timeline/StepConfig.jsx";
import ExecuteNextStep from "./timeline/ExecuteNextStep.jsx";
import ExecutionNavigateButtons from "./timeline/ExecutionNavigateButtons.jsx";
import useExecutionStack from "../../hooks/useExecutionStack.ts";

function Timeline() {
  const playbookSteps = useSelector(stepsSelector);
  const { isLoading } = useGetPlaybookExecutionQuery();
  const dispatch = useDispatch();
  const { steps, nextStep, executingStep } = useExecutionStack();
  const showNextStepExecution = Object.keys(nextStep ?? {}).length > 0;

  const handleShowConfig = (stepId) => {
    const index = playbookSteps.findIndex((step) => step.id === stepId);
    dispatch(showTaskConfig(index));
  };

  if (isLoading) {
    return <Loading title="Your timeline is loading..." />;
  }

  return (
    <main className="p-1 min-h-screen mb-16">
      <div className="border-b p-1 sticky top-0 mb-2 bg-white z-10">
        <h1 className="font-bold text-xl">Timeline</h1>
      </div>

      {steps?.length === 0 && <p>No steps executed in the playbook yet</p>}

      <div className="flex flex-col gap-8 overflow-scroll">
        {steps?.map((step, index) => (
          <StepConfig
            key={index}
            step={step}
            index={index}
            handleShowConfig={handleShowConfig}
          />
        ))}
      </div>

      <ExecutingStep handleShowConfig={handleShowConfig} />

      {showNextStepExecution && !executingStep && (
        <ExecuteNextStep
          handleShowConfig={handleShowConfig}
          stepId={nextStep.id}
        />
      )}

      <ExecutionNavigateButtons steps={steps} />
    </main>
  );
}

export default Timeline;
