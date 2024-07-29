import { useSelector } from "react-redux";
import {
  currentPlaybookSelector,
  playbookSelector,
} from "../../../store/features/playbook/playbookSlice";
import { Step } from "../../../types";

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
