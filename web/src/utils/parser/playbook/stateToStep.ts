import { store } from "../../../store/index.ts";
import { Step } from "../../../types.ts";
import stepToTasks from "./stepToTasks.ts";

export const stateToStep = (step: Step, i?: number) => {
  const { currentStepIndex } = store.getState().playbook;
  return {
    id: step.id,
    name: step.name!,
    description:
      step.description ||
      `Step - ${i ? (i ?? 0) + 1 : parseInt(currentStepIndex ?? "0", 10) + 1}`,
    external_links: step.externalLinks ?? [],
    tasks: stepToTasks(step),
    notes: step.notes ?? "",
  };
};
