import { useSelector } from "react-redux";
import { currentPlaybookSelector } from "../store/features/playbook/playbookSlice.ts";
import { StepRelation, StepRelationContract } from "../types/index.ts";
import useCurrentStep from "./useCurrentStep.ts";

function useHasChildren(id: string) {
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const [step] = useCurrentStep(id);
  const relations: (StepRelation | StepRelationContract)[] =
    currentPlaybook?.step_relations ?? [];

  const child = relations.findIndex((r) => {
    if (typeof r.parent === "string") {
      return r.parent === step?.id;
    }
    return r.parent.reference_id === step?.reference_id;
  });

  return child !== -1;
}

export default useHasChildren;
