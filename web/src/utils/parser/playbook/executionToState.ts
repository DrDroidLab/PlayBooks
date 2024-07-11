import { currentPlaybookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { store } from "../../../store/index.ts";
import { Playbook, Step, Task } from "../../../types/index.ts";
import extractExecutionRelations from "./execution/extractExecutionRelations.ts";
import extractExecutionTasks from "./execution/extractExecutionTasks.ts";

function executionToState(playbook_execution: any): Playbook {
  const currentPlaybook: Playbook | undefined = currentPlaybookSelector(
    store.getState(),
  );
  const playbookSteps = structuredClone(currentPlaybook?.steps ?? []);
  const playbookRelations = structuredClone(
    currentPlaybook?.step_relations ?? [],
  );
  const playbook: Playbook = playbook_execution?.playbook;
  const stepExecutionLogs: any = playbook_execution?.step_execution_logs ?? {};
  const executedSteps: Step[] = [];

  const tasks: Task[] = structuredClone(
    currentPlaybook?.ui_requirement.tasks ?? [],
  );
  Object.values(stepExecutionLogs)?.forEach((stepExecutionLog: any) => {
    let executionStep: Step = stepExecutionLog.step;
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

    executionStep = {
      ...executionStep,
      tasks: [],
      ui_requirement: {
        showOutput: true,
        outputLoading: false,
        isOpen: false,
        showError: false,
      },
    };

    extractExecutionTasks(
      stepExecutionLog?.task_execution_logs,
      tasks,
      step,
      stepIndex,
      executionStep,
    );

    extractExecutionRelations(
      stepExecutionLog?.relation_execution_logs,
      playbookRelations,
    );

    if (stepIndex === -1) {
      playbookSteps.push(step);
    } else {
      playbookSteps[stepIndex] = step;
    }
    executedSteps.push(executionStep);
  });

  return {
    ...(currentPlaybook ?? playbook),
    steps: playbookSteps,
    step_relations: playbookRelations,
    ui_requirement: {
      tasks,
      isExisting: true,
      executedSteps,
    },
  };
}

export default executionToState;
