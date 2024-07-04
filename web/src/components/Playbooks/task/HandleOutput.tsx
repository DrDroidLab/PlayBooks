import React from "react";
import { unsupportedInterpreterTypes } from "../../../utils/unsupportedInterpreterTypes.ts";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";
import SelectInterpretation from "../steps/Interpretation.jsx";
import PlaybookStepOutput from "../steps/PlaybookStepOutput.jsx";

function HandleOutput({ id, showHeading = true }) {
  const [task] = useCurrentTask(id);
  const showOutput = task?.ui_requirement?.showOutput;

  if (!task) return;
  const output = task.ui_requirement.output;

  return (
    <div>
      {showOutput && (
        <>
          {showHeading && (
            <p className={"text-sm mt-2 text-violet-500"}>
              <b>Output</b>
            </p>
          )}
          <div className="my-1">
            {Object.keys(task.ui_requirement.output?.interpretation ?? {})
              .length > 0 && <SelectInterpretation id={id} />}
          </div>
          {!task.ui_requirement.output && (
            <div
              className={`${
                !showHeading ? "max-h-full" : "max-h-[500px] overflow-hidden"
              } bg-gray-50 p-1 h-full w-full`}>
              <PlaybookStepOutput
                showHeading={showHeading}
                stepOutput={null}
                stepId={task.id}
              />
            </div>
          )}

          <div
            className={`${
              !showHeading ? "max-h-full" : "max-h-[500px] overflow-hidden"
            } h-full bg-gray-50 p-1 flex flex-col items-stretch mr-0 justify-between lg:flex-row w-full gap-2 max-w-full`}>
            <div className="w-full">
              <PlaybookStepOutput
                showHeading={showHeading}
                stepOutput={output}
                stepId={task.id}
              />
            </div>
            {Object.keys(output?.interpretation).length > 0 &&
              unsupportedInterpreterTypes.includes(
                output?.interpretation?.interpreter_type,
              ) && (
                <div className="lg:w-2/5 w-full h-full">
                  <SelectInterpretation id={task.id} />
                </div>
              )}
          </div>
        </>
      )}
    </div>
  );
}

export default HandleOutput;
