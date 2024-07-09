import { Playbook, Step, Task } from "../../../types/index.ts";

function executionToState(playbook_execution: any): Playbook {
  const playbook: Playbook = playbook_execution?.playbook;
  const stepExecutionLogs: any = playbook_execution?.step_execution_logs ?? {};

  const tasks: Task[] = [];
  const steps: Step[] =
    Object.values(stepExecutionLogs ?? {})?.map((stepExecutionLog) => {
      const step = structuredClone((stepExecutionLog as any).step);
      step.tasks = (stepExecutionLog as any)?.task_execution_logs?.map(
        (log: any) => {
          tasks.push({
            ...log.task,
            ui_requirement: {
              output: {
                data: log.result,
                interpretation: log.interpretation,
              },
              showOutput: true,
              showError: log?.result?.error !== undefined,
              outputError: log?.result?.error,
              outputLoading: false,
            },
          });
          return log.task.id;
        },
      );
      return step;
    }) ?? [];

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

export default executionToState;
