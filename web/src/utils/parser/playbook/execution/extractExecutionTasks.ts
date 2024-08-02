import { Step, Task } from "../../../../types/index.ts";

function extractExecutionTasks(
  taskLogs: any,
  tasks: Task[],
  step: Step,
  stepIndex: number,
  executionStep: Step,
) {
  taskLogs?.forEach((log: any) => {
    const taskInPlaybook: Task | undefined = tasks.find(
      (task) => task.id === log.task?.id,
    );
    if (taskInPlaybook) {
      if (taskInPlaybook.ui_requirement) {
        taskInPlaybook.ui_requirement.outputs = [];
      }
      taskInPlaybook.ui_requirement = {
        ...taskInPlaybook.ui_requirement,
        outputs: [
          ...(taskInPlaybook.ui_requirement?.outputs ?? []),
          {
            data: { ...log.result, timestamp: log.timestamp },
            execution_global_variable_set: log.result.task_local_variable_set,
            interpretation: log.interpretation,
          },
        ],
        showOutput: true,
        showError: log?.result?.error !== undefined,
        outputError: log?.result?.error,
        outputLoading: false,
      };
      if (taskInPlaybook.id)
        executionStep.tasks.push(structuredClone(taskInPlaybook));
    } else {
      const newTask = {
        ...log.task,
        ui_requirement: {
          outputs: [
            {
              data: log.result,
              interpretation: log.interpretation,
            },
          ],
          showOutput: true,
          showError: log?.result?.error !== undefined,
          outputError: log?.result?.error,
          outputLoading: false,
        },
      };
      tasks.push(newTask);
      if (newTask.id && !executionStep.tasks.includes(newTask.id))
        executionStep.tasks.push(newTask);
      if (stepIndex === -1) {
        step.tasks.push(log.task);
      }
    }
  });
}

export default extractExecutionTasks;
