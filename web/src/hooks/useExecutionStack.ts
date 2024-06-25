import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  popFromExecutionStack,
  pushToExecutionStack,
} from "../store/features/playbook/playbookSlice.ts";
import { useGetPlaybookExecutionQuery } from "../store/features/playbook/api/index.ts";
import { executionToPlaybook } from "../utils/parser/playbook/executionToPlaybook.ts";
import { Step } from "../types.ts";
import { useEffect } from "react";

function useExecutionStack() {
  const {
    executionStack,
    executionId,
    steps: playbookSteps,
  } = useSelector(playbookSelector);
  const dispatch = useDispatch();
  const { data, isFetching, refetch } = useGetPlaybookExecutionQuery();
  const steps = executionToPlaybook(data?.playbook_execution);
  const lastStep =
    steps?.length > 0
      ? (playbookSteps ?? []).find(
          (step: Step) => step.id === steps[(steps?.length || 1) - 1]?.id,
        )
      : undefined;
  const relationLogs = lastStep?.relationLogs ?? [];
  const nextPossibleStepLogs = relationLogs?.filter(
    (log: any) => log.evaluation_result,
  );
  const showNextStepExecution = nextPossibleStepLogs?.length > 0;
  const executingStep = (playbookSteps ?? []).find(
    (step: Step) => step.outputLoading,
  );
  const nextStep =
    executionStack?.length > 0
      ? playbookSteps.find(
          (e: Step) => e.id === executionStack[executionStack.length - 1],
        )
      : {};

  useEffect(() => {
    if (!executingStep?.outputLoading && executionId) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executingStep?.outputLoading]);

  useEffect(() => {
    if (!executingStep?.outputLoading && !isFetching) {
      push();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  const push = () => {
    console.log("woho", nextPossibleStepLogs);
    dispatch(pushToExecutionStack(nextPossibleStepLogs));
  };

  const pop = () => {
    dispatch(popFromExecutionStack());
  };

  return {
    executionStack,
    steps,
    showNextStepExecution,
    nextStep,
    executingStep,
    push,
    pop,
  };
}

export default useExecutionStack;
