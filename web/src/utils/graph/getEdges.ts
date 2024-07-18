import { MarkerType } from "reactflow";
import { currentPlaybookSelector } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";
import { Step } from "../../types/index.ts";

function isStep(object: any): object is Step {
  return object && typeof object.id === "string";
}
export const getEdges = () => {
  const playbook = currentPlaybookSelector(store.getState());
  const playbookRelations = playbook?.step_relations ?? [];
  const stepEdges = playbookRelations?.map((relation) => ({
    ...relation,
    source: isStep(relation.parent)
      ? `node-${relation.parent?.id}`
      : relation.parent,
    target: `node-${(relation.child as Step).id}`,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    type: "custom",
  }));

  return stepEdges;
};
