import { useSelector } from "react-redux";
import { currentPlaybookSelector } from "../store/features/playbook/playbookSlice.ts";
import { Step } from "../types/step.ts";

export default function useCurrentStep(id?: string): Step | undefined {
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const steps = currentPlaybook?.steps ?? [];

  const step = steps?.find((step) => step.id === id);

  return step;
}
