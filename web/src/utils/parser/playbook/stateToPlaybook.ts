import { store } from "../../../store/index.ts";
import { currentPlaybookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import removeKeyFromObject from "../../removeKeys.ts";
import { Playbook, Step, Task } from "../../../types/index.ts";

function stateToPlaybook() {
  const currentPlaybook = currentPlaybookSelector(store.getState());
  if (!currentPlaybook) return null;
  const playbookTasks = currentPlaybook.ui_requirement.tasks;
  const tasks = removeKeyFromObject(playbookTasks, "ui_requirement");

  const playbook: Playbook = removeKeyFromObject(
    currentPlaybook,
    "ui_requirement",
  );

  playbook.steps = playbook.steps.map((step: Step) => ({
    ...step,
    id: "0",
    tasks: step.tasks.map((taskId: Task | string) => ({
      ...tasks.find(
        (task) => task.id === (typeof taskId === "string" ? taskId : task.id),
      ),
      id: "0",
      interpreter_type: undefined,
    })),
  }));

  playbook.step_relations = playbook.step_relations.map((relation) => ({
    id: "0",
    parent: {
      reference_id:
        typeof relation.parent !== "string"
          ? relation.parent.reference_id ?? ""
          : "",
    },
    child: {
      reference_id: relation.child.reference_id ?? "",
    },
    condition: relation.condition,
  }));

  return playbook;
}

export default stateToPlaybook;
