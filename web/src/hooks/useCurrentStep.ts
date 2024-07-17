import { useSelector } from "react-redux";
import {
  currentPlaybookSelector,
  playbookSelector,
} from "../store/features/playbook/playbookSlice.ts";
import { Step } from "../types/step.ts";

export default function useCurrentStep(
  id?: string,
): [Step | undefined, string | undefined] {
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const { currentVisibleStep } = useSelector(playbookSelector);
  const steps = currentPlaybook?.steps ?? [];
  const currentId = id ?? currentVisibleStep;

  const step = steps?.find((step) => step.id === currentId);

  return [step, step?.id];
}
