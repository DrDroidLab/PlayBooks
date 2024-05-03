import PlaybookStepOutput from "./PlaybookStepOutput";
import styles from "./index.module.css";
import { SOURCES } from "../../../constants/index.ts";
import { constructBuilder } from "../../../utils/playbooksData.ts";
import TaskDetails from "./TaskDetails.jsx";

const PlaybookStep = ({ card, index }) => {
  const showOutput = card.showOutput;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <TaskDetails
        task={card}
        data={constructBuilder(card, index)}
        stepIndex={index}
      />

      <div>
        {showOutput && card.source !== SOURCES.TEXT && (
          <>
            <p className={styles["notesHeading"]}>
              <b>Output</b>
            </p>
            {[card.output].map((output, index) => {
              return (
                <div className={styles["output-box"]}>
                  <PlaybookStepOutput
                    key={index}
                    error={card.outputError}
                    stepOutput={output}
                  />
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
