import { currentPlaybookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { store } from "../../../store/index.ts";
import { Playbook, Task } from "../../../types/index.ts";

function executionToState(playbook_execution: any): Playbook {
  const currentPlaybook: Playbook | undefined = currentPlaybookSelector(
    store.getState(),
  );
  const playbook: Playbook = playbook_execution?.playbook;
  const stepExecutionLogs: any = playbook_execution?.step_execution_logs ?? {};

  const tasks: Task[] = structuredClone(
    currentPlaybook?.ui_requirement.tasks ?? [],
  );
  Object.values(stepExecutionLogs ?? {})?.forEach((stepExecutionLog) => {
    (stepExecutionLog as any)?.task_execution_logs?.forEach((log: any) => {
      const taskInPlaybook: Task | undefined = tasks.find(
        (task) => task.id === log.task?.id,
      );
      if (taskInPlaybook) {
        taskInPlaybook.ui_requirement = {
          ...taskInPlaybook.ui_requirement,
          output: {
            data: { ...log.result, timestamp: log.timestamp },
            interpretation: log.interpretation,
          },
          showOutput: true,
          showError: log?.result?.error !== undefined,
          outputError: log?.result?.error,
          outputLoading: false,
        };
      } else {
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
      }
    });
  });

  return {
    ...(currentPlaybook ?? playbook),
    ui_requirement: {
      tasks,
      isCopied: false,
      isExisting: true,
    },
  };
}

export default executionToState;
