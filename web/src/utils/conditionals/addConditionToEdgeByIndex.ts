import { store } from "../../store/index.ts";
import {
  playbookSelector,
  setPlaybookKey,
} from "../../store/features/playbook/playbookSlice.ts";

const playbookKey = "playbookEdges";

export function addConditionToEdgeByIndex(
  key: string,
  value: any,
  index: number,
  conditionIndex: number,
) {
  const { playbookEdges } = playbookSelector(store.getState());
  const edges = structuredClone(playbookEdges ?? []);
  if (edges.length === 0) return;
  if (!edges[index]) return;
  edges[index].conditions[conditionIndex][key] = value;
  store.dispatch(
    setPlaybookKey({
      key: playbookKey,
      value: edges,
    }),
  );
}
