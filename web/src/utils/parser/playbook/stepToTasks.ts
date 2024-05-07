import { PlaybookTask, Step } from "../../../types.ts";
import { handleStepSourceInjector } from "./handleStepSourceInjector.ts";

export default function stepToTasks(step: Step): PlaybookTask[] {
  const tasks: PlaybookTask[] = handleStepSourceInjector(step);

  console.log("tasks", tasks);
  return tasks;
}
