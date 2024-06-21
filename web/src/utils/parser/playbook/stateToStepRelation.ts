import { store } from "../../../store/index.ts";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { PlaybookContractStep, Step } from "../../../types.ts";
import conditionToRule from "./conditionToRule.ts";

export const stateToStepRelation = (
  playbookContractSteps: PlaybookContractStep[],
) => {
  const { playbookEdges, steps } = playbookSelector(store.getState());

  const relations = (playbookEdges ?? [])
    .filter((e) => e.source !== "playbook")
    .map((edge) => {
      const parentId = edge.source.split("-")[1];
      const childId = edge.target.split("-")[1];
      const parentIndex = steps.findIndex((s) => s.id === parentId);
      const childIndex = steps.findIndex((s) => s.id === childId);
      const parent = playbookContractSteps[parentIndex];
      const child = playbookContractSteps[childIndex];

      const parentStep: Step = steps[parentIndex];

      return {
        parent: {
          reference_id: parent?.reference_id,
        },
        child: {
          reference_id: child?.reference_id,
        },
        condition:
          edge.conditions?.length > 0
            ? {
                rules: edge.conditions?.map((e) =>
                  conditionToRule(parentStep, parent, e),
                ),
                logical_operator: edge.globalRule,
              }
            : {},
      };
    });

  return relations;
};
