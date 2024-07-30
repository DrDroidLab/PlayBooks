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
        {output.execution_global_variable_set && (
          <p className="text-xs my-1 flex items-center">
            <span className="bg-violet-100 rounded p-1">
              {Object.keys(output.execution_global_variable_set)?.[0]}
            </span>{" "}
            :{" "}
            {
              output.execution_global_variable_set?.[
                Object.keys(output.execution_global_variable_set)?.[0]
              ]
            }
          </p>
        )}
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
