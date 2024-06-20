import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { store } from "../../../store/index.ts";
import { Step } from "../../../types.ts";
import stepToTasks from "./stepToTasks.ts";
import { v4 as uuidv4 } from "uuid";

export const stateToStep = (step: Step, i?: number) => {
  const { currentStepIndex } = playbookSelector(store.getState());
  const tasks = stepToTasks(step);
  return {
    id: step.id,
    reference_id: uuidv4(),
    name: step.name!,
    description:
      step.description ||
      `Step - ${i ? (i ?? 0) + 1 : parseInt(currentStepIndex ?? "0", 10) + 1}`,
    external_links: step.externalLinks ?? [],
    tasks,
    notes: step.notes ?? "",
    interpreter_type: step.interpreter?.type,
    children: step.children ?? [],
  };
};
