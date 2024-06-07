import React from "react";
import SelectInterpretation from "./Interpretation";
import PlaybookStepOutput from "./PlaybookStepOutput";
import { SOURCES } from "../../../constants/index.ts";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import { unsupportedInterpreterTypes } from "../../../utils/unsupportedInterpreterTypes.ts";
import styles from "./index.module.css";

function HandleOutput({ index, stepData }) {
  const [stepFromState] = useCurrentStep(index);
  const step = stepData ?? stepFromState;
  const showOutput = step.showOutput;

  return (
    <div>
      {showOutput && step.source !== SOURCES.TEXT && (
        <>
          <p className={styles["notesHeading"]}>
            <b>Output</b>
          </p>
          <div className="my-2">
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
            <div className={styles["output-box"]}>
              <PlaybookStepOutput stepOutput={null} />
            </div>
          )}
          {(step.outputs?.data ?? [])?.map((output, index) => {
            return (
              <div
                key={index}
                className={`${styles["output-box"]} flex flex-col items-stretch mr-0 justify-between lg:flex-row w-full gap-4 max-w-full`}>
                <div className="w-full">
                  <PlaybookStepOutput stepOutput={output} />
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
