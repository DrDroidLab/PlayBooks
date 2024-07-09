import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  popFromExecutionStack,
} from "../store/features/playbook/playbookSlice.ts";
import { useGetPlaybookExecutionQuery } from "../store/features/playbook/api/index.ts";
import { useEffect } from "react";
import { Step } from "../types/index.ts";

function useExecutionStack() {
  const { executionStack, executionId, currentPlaybook } =
    useSelector(playbookSelector);
  const steps = currentPlaybook?.steps ?? [];
  const dispatch = useDispatch();
  const { refetch } = useGetPlaybookExecutionQuery();
  const executingStep = (steps ?? []).find(
    (step: Step) => step.ui_requirement.outputLoading,
  );
  const nextStep =
    executionStack?.length > 0
      ? steps.find(
          (e: Step) => e.id === executionStack[executionStack.length - 1],
        )
      : {};

  useEffect(() => {
    if (!executingStep?.ui_requirement.outputLoading && executionId) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executingStep?.ui_requirement.outputLoading]);

  const pop = () => {
    dispatch(popFromExecutionStack());
  };

  return {
    executionStack,
    steps,
    nextStep,
    executingStep,
    pop,
  };
}

export default useExecutionStack;
