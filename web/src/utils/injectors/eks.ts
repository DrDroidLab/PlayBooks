import { PlaybookTask } from "../../types.ts";
import { Step } from "../../types/index.ts";

export const injectEksTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let data_fetch_task = {
    source: step.source.toUpperCase(),
    eks_data_fetch_task: {
      region: step.eksRegion!,
      cluster: step.cluster!,
      command_type: step.command?.type!,
      namespace: step.eksNamespace!,
      description: step.command.description!,
    },
  };

  return [
    {
      ...baseTask,
      type: "DATA_FETCH",
      data_fetch_task,
    },
  ];
};
