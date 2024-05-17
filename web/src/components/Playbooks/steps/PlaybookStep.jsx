import PlaybookStepOutput from "./PlaybookStepOutput";
import styles from "./index.module.css";
import { SOURCES } from "../../../constants/index.ts";
import { constructBuilder } from "../../../utils/playbooksData.ts";
import TaskDetails from "./TaskDetails.jsx";
import { useEffect, useState } from "react";
import Interpretation from "../../common/Interpretation/index.tsx";

const PlaybookStep = ({ card, index }) => {
  const showOutput = card.showOutput;
  const [showConfig, setShowConfig] = useState(!showOutput);

  const toggleConfig = () => {
    setShowConfig(!showConfig);
  };

  useEffect(() => {
    setShowConfig(!showOutput);
  }, [showOutput]);

  return (
    <div className="flex flex-col gap-2 mt-2">
      {showOutput && (
        <button
          onClick={toggleConfig}
          className="border border-violet-500 text-violet-500 rounded p-1 hover:bg-violet-500 hover:text-white transition-all text-xs w-fit">
          {showConfig ? "Hide" : "Show"} Config
        </button>
      )}
      {showConfig && (
        <TaskDetails
          task={card}
          data={constructBuilder(card, index)}
          stepIndex={index}
        />
      )}

      <div>
        {showOutput && card.source !== SOURCES.TEXT && (
          <>
            <p className={styles["notesHeading"]}>
              <b>Output</b>
            </p>
            <div className="my-2">
              {Object.keys(card?.outputs?.stepInterpretation ?? {}).length >
                0 && (
                <Interpretation
                  type="Step"
                  title={card?.outputs?.stepInterpretation?.title}
                  description={card?.outputs?.stepInterpretation?.description}
                  summary={card?.outputs?.stepInterpretation?.summary}
                />
              )}
            </div>
            {(!card.outputs || card.outputs?.data?.length === 0) && (
              <div className={styles["output-box"]}>
                <PlaybookStepOutput
                  key={index}
                  error={card.outputError}
                  stepOutput={null}
                />
              </div>
            )}
            {(card.outputs?.data ?? [])?.map((output, index) => {
              return (
                <div
                  className={`${styles["output-box"]} flex flex-col items-stretch mr-0 justify-between lg:flex-row w-full gap-4 max-w-full`}>
                  <div className="w-full">
                    <PlaybookStepOutput
                      key={index}
                      error={card.outputError}
                      stepOutput={output}
                      step={card}
                    />
                  </div>
                  {Object.keys(output?.interpretation).length > 0 && (
                    <div className="w-2/5 h-full">
                      <Interpretation
                        title={output?.task_interpretation?.title}
                        description={output?.task_interpretation?.description}
                        summary={output?.task_interpretation?.summary}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default PlaybookStep;
