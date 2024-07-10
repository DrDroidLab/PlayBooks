import { currentPlaybookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { store } from "../../../store/index.ts";
import { Playbook, Step, Task } from "../../../types/index.ts";

function executionToState(playbook_execution: any): Playbook {
  const currentPlaybook: Playbook | undefined = currentPlaybookSelector(
    store.getState(),
  );
  const playbookSteps = structuredClone(currentPlaybook?.steps ?? []);
  const playbook: Playbook = playbook_execution?.playbook;
  const stepExecutionLogs: any = playbook_execution?.step_execution_logs ?? {};

  const tasks: Task[] = structuredClone(
    currentPlaybook?.ui_requirement.tasks ?? [],
  );
  Object.values(stepExecutionLogs)?.forEach((stepExecutionLog: any) => {
    const executionStep: Step = stepExecutionLog.step;
    const stepIndex = playbookSteps.findIndex(
      (step) => step.id === executionStep.id,
    );
    const step: Step =
      stepIndex !== -1 ? playbookSteps[stepIndex] : executionStep;

    step.ui_requirement = {
      ...step.ui_requirement,
      outputLoading: false,
      showOutput: true,
    };
    if (stepIndex === -1) {
      step.tasks = [];
    }

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
        if (stepIndex === -1) {
          step.tasks.push(log.task.id);
        }
      }
    });

    if (stepIndex === -1) {
      playbookSteps.push(step);
    } else {
      playbookSteps[stepIndex] = step;
    }
  });

  return {
    ...(currentPlaybook ?? playbook),
    steps: playbookSteps,
    ui_requirement: {
      tasks,
      isCopied: false,
      isExisting: true,
    },
  };
}

export default executionToState;
