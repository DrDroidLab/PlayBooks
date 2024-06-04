import { useSelector } from "react-redux";
import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";

export default function useCurrentStep() {
  const { currentStepIndex, steps } = useSelector(playbookSelector);
  const step =
    steps.length > 0 && currentStepIndex ? steps[currentStepIndex] : {};

  return [step, currentStepIndex];
}
