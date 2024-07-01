import { MarkerType } from "reactflow";
import { currentPlaybookSelector } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";

export const getEdges = () => {
  const playbook = currentPlaybookSelector(store.getState());
  const playbookRelations = playbook?.step_relations ?? [];
  const stepEdges = playbookRelations?.map((relation) => ({
    ...relation,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }));

  return stepEdges;
};
