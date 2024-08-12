import { Playbook, Step, Task } from "../../../types";

export const relationToState = (
  playbook: Playbook,
  tasks: Task[],
  steps: Step[],
) => {
  playbook?.step_relations?.forEach((relation) => {
    const sourceId =
      typeof relation.parent !== "string" ? (relation.parent as Step).id : "";
    const targetId = (relation.child as Step).id;
    relation.ui_requirement = {
      playbookRelationId: relation.id,
    };
    relation.id = `edge-${sourceId}-${targetId}`;
    const ruleSets = relation.condition?.rule_sets ?? [];
    if (relation.condition) {
      relation.condition.rule_sets = ruleSets.map((ruleSet) => ({
        ...ruleSet,
        rules: ruleSet.rules?.map((rule) => ({
          ...rule,
          task: tasks.find((e) => e.id === rule.task.id) ?? rule.task,
          [rule.type.toLowerCase()]: {
            ...rule?.[rule?.type?.toLowerCase()],
            isNumeric:
              rule?.[rule?.type?.toLowerCase()]?.numeric_value_threshold !==
                undefined ?? false,
          },
        })),
      }));
    }
    relation.parent = steps?.find((e) => e.id === sourceId) ?? relation.parent;
    relation.child = steps?.find((e) => e.id === targetId) ?? relation.child;
  });
};
