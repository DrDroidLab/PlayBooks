import { useSelector } from "react-redux";
import {
  playbookSelector,
  stepsSelector,
} from "../store/features/playbook/playbookSlice.ts";

export default function useCurrentStep() {
  const steps = useSelector(stepsSelector);
  const { currentStepIndex } = useSelector(playbookSelector);
  const step =
    steps.length > 0 && currentStepIndex ? steps[currentStepIndex] : {};

  return [step, currentStepIndex];
}
