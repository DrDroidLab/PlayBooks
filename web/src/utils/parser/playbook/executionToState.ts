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

    extractExecutionTasks(
      stepExecutionLog?.task_execution_logs,
      tasks,
      step,
      stepIndex,
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
  });

  return {
    ...(currentPlaybook ?? playbook),
    steps: playbookSteps,
    step_relations: playbookRelations,
    ui_requirement: {
      tasks,
      isCopied: false,
      isExisting: true,
    },
  };
}

export default executionToState;
