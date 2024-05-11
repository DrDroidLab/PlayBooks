import { PlaybookTask, Step } from "../../types.ts";

export const injectBashTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let bash_command_task = {
    command: step.command,
    remote_server: step.remote_server,
  };

  return [
    {
      ...baseTask,
      type: "ACTION",
      action_task: {
        source: step.source.toUpperCase(),
        bash_command_task,
      },
    },
  ];
};
