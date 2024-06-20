import { Step } from "../../../types.ts";
import stepToTasks from "./stepToTasks.ts";
import { v4 as uuidv4 } from "uuid";

export const stateToStep = (step: Step, i?: number) => {
  const tasks = stepToTasks(step);
  return {
    id: step.id.length > 10 ? "0" : step.id,
    reference_id: uuidv4(),
    name: step.name!,
    description:
      step.description || `Step - ${i ? (i ?? 0) + 1 : step.stepIndex + 1}`,
    external_links: step.externalLinks ?? [],
    tasks,
    notes: step.notes ?? "",
    interpreter_type: step.interpreter?.type,
    children: step.children ?? [],
  };
};
