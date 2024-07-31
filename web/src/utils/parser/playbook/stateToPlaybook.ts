import { store } from "../../../store/index.ts";
import { currentPlaybookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import removeKeyFromObject from "../../removeKeys.ts";
import { Playbook, Step, Task } from "../../../types/index.ts";
import checkId from "../../checkId.ts";

function stateToPlaybook(): Playbook | null {
  const currentPlaybook = currentPlaybookSelector(store.getState());
  if (!currentPlaybook) return null;
  const playbookTasks = currentPlaybook.ui_requirement.tasks;
  const tasks = removeKeyFromObject(playbookTasks, "ui_requirement");

  const playbook: Playbook = removeKeyFromObject(
    currentPlaybook,
    "ui_requirement",
  );

  playbook.steps = playbook?.steps?.map((step: Step) => ({
    ...step,
    id: checkId(step.id),
    tasks: step.tasks?.map((taskId: Task | string) => ({
      ...tasks.find(
        (task) => task.id === (typeof taskId === "string" ? taskId : taskId.id),
      ),
      id: checkId(
        (typeof taskId === "string" ? taskId : taskId.id) ?? "0".toString(),
      ),
    })),
  }));

  playbook.step_relations = playbook.step_relations?.map((relation) => ({
    id: checkId(relation.id),
    parent: {
      reference_id:
        typeof relation.parent !== "string"
          ? relation.parent.reference_id ?? ""
          : "",
    },
    child: {
      reference_id: relation.child.reference_id ?? "",
    },
    condition: relation.condition
      ? {
          ...relation.condition,
          rules:
            relation.condition?.rules?.map((rule) => ({
              ...rule,
              task: {
                reference_id: rule.task.reference_id ?? "",
                id: checkId(rule.task.id ?? ""),
              },
            })) ?? [],
        }
      : undefined,
  }));

  return playbook;
}

export default stateToPlaybook;
