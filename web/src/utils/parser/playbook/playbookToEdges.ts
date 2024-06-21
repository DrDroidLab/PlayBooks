import { PlaybookContract, Step } from "../../../types.ts";

function playbookToEdges(playbook: PlaybookContract, steps: Step[]): any {
  const stepRelations = playbook.step_relations ?? [];
  const playbookSteps = playbook.steps ?? [];

  const list: any = [];
  for (let edge of Object.values(stepRelations ?? {})) {
    const playbookEdge = edge as any;
    const parentStepId = playbookEdge.parent.id;
    const childStepId = playbookEdge.child.id;

    const parentStep = steps.find((step) => step.id === parentStepId);

    const source = `node-${parentStepId}`;
    const target = `node-${childStepId}`;
    const id = `edge-${parentStepId}-${childStepId}`;
    const globalRule = playbookEdge?.condition?.logical_operator;

    const conditions = (playbookEdge?.condition?.rules ?? []).map((rule) => {
      const ruleType = rule[rule.type.toLowerCase()];
      const taskIds = parentStep?.taskIds;

      return {
        function: ruleType.function,
        operation: ruleType.operator,
        value:
          ruleType.threshold ??
          ruleType.numeric_value_threshold ??
          ruleType.string_value_threshold,
        task: (taskIds?.indexOf(rule?.task?.id) ?? 0).toString(),
        window: ruleType.window,
        columnName: ruleType.column_name,
        isNumeric: ruleType.numeric_value_threshold !== undefined,
        conditionType: ruleType.type,
        type: rule.type,
      };
    });

    list.push({
      source,
      target,
      id,
      globalRule,
      conditions,
      type: conditions.length > 0 ? "custom" : "",
    });
  }

  const map = playbookSteps.reduce((childrenMapping, step) => {
    step.children?.forEach((child) => {
      childrenMapping[child.child.id] = true;
    });
    return childrenMapping;
  }, {});

  steps.forEach((step) => {
    if (!map[step.id ?? ""]) {
      list.push({
        source: "playbook",
        target: `node-${step.id}`,
        id: `edge-${step.id}`,
      });
    }
  });

  return list;
}

export default playbookToEdges;
