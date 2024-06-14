import { useSelector } from "react-redux";
import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";

export default function useCurrentStep(index?: number, stepData?: any) {
  const { currentStepIndex, steps } = useSelector(playbookSelector);
  const currentIndex = index ?? currentStepIndex;
  const step =
    steps.length > 0 && currentIndex !== null && currentIndex !== undefined
      ? steps[currentIndex]
      : {};

  return [stepData ?? step, currentIndex];
}
