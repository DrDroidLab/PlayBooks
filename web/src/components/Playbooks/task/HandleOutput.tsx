import { Task } from "../../../types/index.ts";
import useCurrentTask from "../../../hooks/playbooks/task/useCurrentTask.ts";
import HandleTaskOutput from "./HandleTaskOutput.tsx";

type HandleOutputPropTypes = {
  id: string | undefined;
  showHeading?: boolean;
  taskFromExecution?: Task;
};

function HandleOutput({
  id,
  showHeading = true,
  taskFromExecution = undefined,
}: HandleOutputPropTypes) {
  const [taskFromPlaybook] = useCurrentTask(id);
  const task = taskFromExecution ?? taskFromPlaybook;
  const showOutput = task?.ui_requirement?.showOutput;

  if (!task) return;
  const outputs = task.ui_requirement.outputs;

  return (
    <div>
      {showOutput && (
        <>
          {showHeading ? (
            <p className={"text-sm my-2 text-violet-500"}>
              <b>Output</b>
            </p>
          ) : (
            <p className={"text-sm my-1 text-violet-500"}>
              <b>{task?.description}</b>
            </p>
          )}

          {outputs?.map((output: any, index: number) => (
            <HandleTaskOutput
              key={index}
              showHeading={showHeading}
              task={task}
              output={output}
            />
          ))}
        </>
      )}
    </div>
  );
}

export default HandleOutput;
