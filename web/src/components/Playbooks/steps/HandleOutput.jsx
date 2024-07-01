import React from "react";
import SelectInterpretation from "./Interpretation";
import PlaybookStepOutput from "./PlaybookStepOutput";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import { unsupportedInterpreterTypes } from "../../../utils/unsupportedInterpreterTypes.ts";

function HandleOutput({ id, stepData = undefined, showHeading = true }) {
  const [stepFromState] = useCurrentStep(id);
  const step = stepData ?? stepFromState;
  const showOutput = step.showOutput;

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
            {Object.keys(step?.outputs?.stepInterpretation ?? {}).length >
              0 && (
              <SelectInterpretation
                type="Step"
                title={step?.outputs?.stepInterpretation?.title}
                description={step?.outputs?.stepInterpretation?.description}
                summary={step?.outputs?.stepInterpretation?.summary}
              />
            )}
          </div>
          {(!step.outputs || step.outputs?.data?.length === 0) && (
            <div
              className={`${
                !showHeading ? "max-h-full" : "max-h-[500px] overflow-hidden"
              } bg-gray-50 p-1 h-full w-full`}>
              <PlaybookStepOutput
                showHeading={showHeading}
                stepOutput={null}
                stepId={step.id}
              />
            </div>
          )}
          {(step.outputs?.data ?? [])?.map((output, index) => {
            return (
              <div
                key={index}
                className={`${
                  !showHeading ? "max-h-full" : "max-h-[500px] overflow-hidden"
                } h-full bg-gray-50 p-1 flex flex-col items-stretch mr-0 justify-between lg:flex-row w-full gap-2 max-w-full`}>
                <div className="w-full">
                  <PlaybookStepOutput
                    showHeading={showHeading}
                    stepOutput={output}
                    stepId={step.id}
                  />
                </div>
                {Object.keys(output?.interpretation).length > 0 &&
                  unsupportedInterpreterTypes.includes(
                    step?.outputs?.interpretation?.interpreter_type,
                  ) && (
                    <div className="lg:w-2/5 w-full h-full">
                      <SelectInterpretation
                        title={output?.interpretation?.title}
                        description={output?.interpretation?.description}
                        summary={output?.interpretation?.summary}
                      />
                    </div>
                  )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default HandleOutput;
