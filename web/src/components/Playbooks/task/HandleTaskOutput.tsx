import useCurrentTask from "../../../hooks/playbooks/task/useCurrentTask";
import { unsupportedInterpreterTypes } from "../../../utils/playbook/unsupportedInterpreterTypes";
import Interpretation from "../../common/Interpretation";
import TaskOutput from "./TaskOutput";

function HandleTaskOutput({ showHeading, task, output }) {
  return (
    <div
      className={`${
        !showHeading ? "max-h-full" : "max-h-[500px] overflow-hidden"
      } h-full bg-gray-50  flex flex-col items-stretch mr-0 justify-between lg:flex-row w-full gap-2 max-w-full`}>
      <div className="w-full">
        <TaskOutput
          showHeading={showHeading}
          id={task.id}
          task={task}
          output={output.data}
          error={output.error}
        />
      </div>
      {Object.keys(output?.interpretation ?? {}).length > 0 &&
        !unsupportedInterpreterTypes.includes(
          output?.interpretation?.interpreter_type,
        ) && (
          <div className="lg:w-2/5 w-full h-full">
            <Interpretation {...output.interpretation} />
          </div>
        )}
    </div>
  );
}

export default HandleTaskOutput;
