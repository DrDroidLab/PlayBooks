import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { store } from "../../../store/index.ts";
import { Playbook, Step, Task } from "../../../types/index.ts";
import { v4 as uuidv4 } from "uuid";

function playbookToState(playbook: Playbook): Playbook {
  const { supportedTaskTypes } = playbookSelector(store.getState());
  const tasks: Task[] = [];
  const steps = playbook?.steps?.map((e: Step, i: number) => ({
    ...e,
    ui_requirement: {
      stepIndex: i === 0 ? 0 : undefined,
      isOpen: false,
      showError: false,
    },
  }));
  steps.forEach((step: Step) => {
    const stepTasks: any[] = (step.tasks as Task[]).map((e) => ({
      ...e,
      ui_requirement: {
        stepId: step.id,
        resultType: supportedTaskTypes?.find(
          (t: any) =>
            t.source === e.source &&
            t.task_type === e[e.source.toLowerCase()]?.type,
        )?.result_type,
      },
    }));
    step.reference_id = uuidv4();
    tasks.push(...stepTasks);
  });
  playbook?.step_relations?.forEach((relation) => {
    const sourceId =
      typeof relation.parent !== "string" ? (relation.parent as Step).id : "";
    const targetId = (relation.child as Step).id;
    relation.id = `edge-${sourceId}-${targetId}`;
    const rules = relation.condition?.rules ?? [];
    if (relation.condition)
      relation.condition.rules = rules.map((rule) => ({
        ...rule,
        task: rule?.task?.id,
      }));
  });
  return {
    ...playbook,
    steps,
    ui_requirement: {
      tasks,
      isCopied: false,
      isExisting: true,
    },
  };
}

export default playbookToState;
