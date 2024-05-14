import { PlaybookTask } from "../../../types.ts";
import { Step } from "../../../types/index.ts";
import { handleStepSourceInjector } from "./handleStepSourceInjector.ts";

export default function stepToTasks(step: Step): PlaybookTask[] {
  const tasks: PlaybookTask[] = handleStepSourceInjector(step);
  return tasks;
}
