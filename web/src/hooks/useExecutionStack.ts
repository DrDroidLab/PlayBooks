import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  popFromExecutionStack,
  pushToExecutionStack,
} from "../store/features/playbook/playbookSlice.ts";

function useExecutionStack() {
  const { executionStack } = useSelector(playbookSelector);
  const dispatch = useDispatch();

  const push = (nextPossibleStepLogs: any) => {
    dispatch(pushToExecutionStack(nextPossibleStepLogs));
  };

  const pop = () => {
    dispatch(popFromExecutionStack());
  };

  return {
    push,
    pop,
    executionStack,
  };
}

export default useExecutionStack;
