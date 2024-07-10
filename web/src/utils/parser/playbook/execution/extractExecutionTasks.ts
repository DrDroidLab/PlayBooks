import { Step, Task } from "../../../../types/index.ts";

function extractExecutionTasks(
  taskLogs: any,
  tasks: Task[],
  step: Step,
  stepIndex: number,
) {
  taskLogs?.forEach((log: any) => {
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
}

export default extractExecutionTasks;
