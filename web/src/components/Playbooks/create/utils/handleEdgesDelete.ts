import { Edge } from "reactflow";
import { removeRelation } from "../../../../store/features/playbook/playbookSlice.ts";
import { store } from "../../../../store/index.ts";

function handleEdgesDelete(edges: Edge[]): void {
  edges.forEach((edge) => {
    store.dispatch(removeRelation({ id: edge.id }));
  });
  return;
}

export default handleEdgesDelete;
