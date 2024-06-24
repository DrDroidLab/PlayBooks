import { store } from "../../store/index.ts";
import { playbookSelector } from "../../store/features/playbook/playbookSlice.ts";
import { extractParent } from "../extractData.ts";

export const getParentIds = (stepId: string) => {
  const { playbookEdges } = playbookSelector(store.getState());
  const edges = playbookEdges.filter(
    (edge) => edge.target === `node-${stepId}`,
  );

  const parentIds = edges
    .map((edge) => extractParent(edge?.id))
    .filter((parentId) => parentId);

  return parentIds;
};
