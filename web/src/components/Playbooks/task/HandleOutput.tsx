import React from "react";
import { unsupportedInterpreterTypes } from "../../../utils/unsupportedInterpreterTypes.ts";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";
import TaskOutput from "./TaskOutput.tsx";
import Interpretation from "../../common/Interpretation/index.tsx";

function HandleOutput({ id, showHeading = true }) {
  const [task] = useCurrentTask(id);
  const showOutput = task?.ui_requirement?.showOutput;

  if (!task) return;
  const output = task.ui_requirement.output;

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

          <div
            className={`${
              !showHeading ? "max-h-full" : "max-h-[500px] overflow-hidden"
            } h-full bg-gray-50  flex flex-col items-stretch mr-0 justify-between lg:flex-row w-full gap-2 max-w-full`}>
            <div className="w-full">
              <TaskOutput showHeading={showHeading} id={task.id} />
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
        </>
      )}
    </div>
  );
}

export default HandleOutput;
