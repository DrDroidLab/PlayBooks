import { store } from "../../store/index.ts";
import {
  currentPlaybookSelector,
  setCurrentPlaybookKey,
} from "../../store/features/playbook/playbookSlice.ts";
import setNestedValue from "../common/setNestedValue.ts";

const playbookKey = "step_relations";

export function addVariableRuleToRelationByIndex(
  key: string,
  value: any,
  index: number,
  ruleIndex: number,
  ruleSetIndex: number = 0,
) {
  const currentPlaybook = currentPlaybookSelector(store.getState());
  const relations = currentPlaybook?.[playbookKey];
  const edges = structuredClone(relations ?? []);
  if (edges.length === 0) return;
  if (!edges[index] || !edges[index].condition) return;
  setNestedValue(
    edges[index]?.condition?.rule_sets?.[ruleSetIndex]?.variable_rules?.[
      ruleIndex
    ],
    key,
    value,
  );
  store.dispatch(
    setCurrentPlaybookKey({
      key: playbookKey,
      value: edges,
    }),
  );
}
