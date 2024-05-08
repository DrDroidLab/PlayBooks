import PlaybookStepOutput from "./PlaybookStepOutput";
import styles from "./index.module.css";
import { SOURCES } from "../../../constants/index.ts";
import { constructBuilder } from "../../../utils/playbooksData.ts";
import TaskDetails from "./TaskDetails.jsx";
import { TipsAndUpdatesRounded } from "@mui/icons-material";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";

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
                  className={`${styles["output-box"]} flex flex-col lg:flex-row w-full gap-4`}>
                  <div className="flex-1">
                    <PlaybookStepOutput
                      key={index}
                      error={card.outputError}
                      stepOutput={output}
                      step={card}
                    />
                  </div>
                  <div className="flex-[0.4] bg-pink-50 m-1 rounded ml-0 p-2 flex flex-col gap-2 overflow-scroll">
                    <h1 className="font-bold lg:text-lg text-violet-600 flex gap-2 items-center">
                      <TipsAndUpdatesRounded /> Task Insights
                    </h1>
                    <hr className="border-t-violet-500 border-t-[0.5px] flex-grow-0" />
                    <p className="line-clamp-[18] text-xs">
                      <Markdown>
                        {output?.task_interpretation?.title ??
                          "No interpretation found."}
                      </Markdown>
                    </p>
                  </div>
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
