import { PlaybookTask, Step } from "../../types.ts";

export const injectEksTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let eks_data_fetch_task = {
    region: step.eksRegion!,
    cluster: step.cluster!,
    command_type: step.command?.type!,
    namespace: step.eksNamespace!,
    description: step.command.description!,
  };

  return [
    {
      ...baseTask,
      source: step.source.toUpperCase(),
      eks_data_fetch_task,
    },
  ];
};
