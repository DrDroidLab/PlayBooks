import { store } from "../../store/index.ts";
import {
  currentPlaybookSelector,
  setCurrentPlaybookKey,
} from "../../store/features/playbook/playbookSlice.ts";
import setNestedValue from "../common/setNestedValue.ts";

const playbookKey = "step_relations";

export function addRuleToRelationByIndex(
  key: string,
  value: any,
  index: number,
  ruleIndex: number,
) {
  const currentPlaybook = currentPlaybookSelector(store.getState());
  const relations = currentPlaybook?.[playbookKey];
  const edges = structuredClone(relations ?? []);
  if (edges.length === 0) return;
  if (!edges[index] || !edges[index].condition) return;
  setNestedValue(edges[index].condition.rules[ruleIndex], key, value);
  store.dispatch(
    setCurrentPlaybookKey({
      key: playbookKey,
      value: edges,
    }),
  );
}
