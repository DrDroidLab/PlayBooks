import { MarkerType } from "reactflow";
import { playbookSelector } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";

export const getEdges = () => {
  const { playbookEdges } = playbookSelector(store.getState());
  const stepEdges = playbookEdges.map((edge) => ({
    ...edge,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }));

  return stepEdges;
};
