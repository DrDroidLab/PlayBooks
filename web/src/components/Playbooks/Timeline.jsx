import React, { useEffect, useState } from "react";
import { useLazyGetPlaybookExecutionQuery } from "../../store/features/playbook/api/index.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  setSteps as setStepsInPlaybook,
  showStepConfig,
  stepsSelector,
} from "../../store/features/playbook/playbookSlice.ts";
import { executionToPlaybook } from "../../utils/parser/playbook/executionToPlaybook.ts";
import Loading from "../common/Loading/index.tsx";
import ExecutingStep from "./timeline/ExecutingStep.jsx";
import StepConfig from "./timeline/StepConfig.jsx";
import ExecuteNextStep from "./timeline/ExecuteNextStep.jsx";
import ExecutionNavigateButtons from "./timeline/ExecutionNavigateButtons.jsx";
import useExecutionStack from "../../hooks/useExecutionStack.ts";

function Timeline() {
  const { executionId } = useSelector(playbookSelector);
  const playbookSteps = useSelector(stepsSelector);
  const [triggerGetPlaybookExeution, { isLoading }] =
    useLazyGetPlaybookExecutionQuery();
  const [steps, setSteps] = useState([]);
  const dispatch = useDispatch();
  const { executionStack, push } = useExecutionStack();

  const lastStep = (playbookSteps ?? []).find(
    (step) => step.id === steps[(steps?.length || 1) - 1]?.id,
  );
  const relationLogs = lastStep?.relationLogs ?? [];
  const nextPossibleStepLogs = relationLogs?.filter(
    (log) => log.evaluation_result,
  );

  const showNextStepExecution =
    nextPossibleStepLogs.length > 0 &&
    nextPossibleStepLogs.findIndex((log) => log.evaluation_result) !== -1;

  const executingStep = (playbookSteps ?? []).find(
    (step) => step.outputLoading,
  );

  const nextStep =
    executionStack?.length > 0
      ? playbookSteps.find(
          (e) => e.id === executionStack[executionStack.length - 1],
        )
      : {};

  const addOutputsToSteps = (timelineSteps) => {
    const steps = playbookSteps?.map((step) => {
      const found = timelineSteps.find(
        (stepData) => stepData.id.toString() === step.id.toString(),
      );
      if (found) {
        return found;
      } else {
        return step;
      }
    });
    if (steps.length > 0) dispatch(setStepsInPlaybook(steps));
  };

  const populateData = async () => {
    const data = await triggerGetPlaybookExeution(
      { playbookRunId: executionId },
      false,
    ).unwrap();
    const pbData = executionToPlaybook(data?.playbook_execution);
    setSteps(pbData);
  };

  const handleShowConfig = (stepId) => {
    const index = playbookSteps.findIndex((step) => step.id === stepId);
    dispatch(showStepConfig(index));
  };

  useEffect(() => {
    if (!executingStep?.outputLoading && executionId) {
      populateData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executingStep?.outputLoading]);

  useEffect(() => {
    if (executionId) populateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executionId]);

  useEffect(() => {
    if (steps?.length > 0 && playbookSteps?.length > 0) {
      addOutputsToSteps(steps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  useEffect(() => {
    if (nextPossibleStepLogs.length > 0 && !executingStep?.outputLoading) {
      push(nextPossibleStepLogs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextPossibleStepLogs]);

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
