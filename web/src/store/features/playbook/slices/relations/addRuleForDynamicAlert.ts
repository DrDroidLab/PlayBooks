import { PayloadAction } from "@reduxjs/toolkit";
import { PlaybookUIState } from "../../../../../types";
import { playbookSlice } from "../../playbookSlice";

export const addRuleForDynamicAlert = (
  state: PlaybookUIState,
  {
    payload,
  }: PayloadAction<{
    id: string;
    ruleSetIndex: number;
  }>,
) => {
  const { id, ruleSetIndex } = payload;

  const tasks = state.currentPlaybook?.ui_requirement.tasks ?? [];

  const relation = state.currentPlaybook?.step_relations.find(
    (e) => e.id === id,
  );
  if (!relation || !relation.condition) return;
  const ruleSet = relation.condition.rule_sets?.[ruleSetIndex];
  if (!ruleSet.rules) ruleSet.rules = [];
  ruleSet.rules.push({
    type: "TIMESERIES",
    task: {
      reference_id: tasks[0].reference_id,
      id: tasks[0].id,
    },
    timeseries: {
      type: "ROLLING",
      window: "5",
      function: "",
      operator: "",
      threshold: "",
    },
  });
};
