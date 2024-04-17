import PlaygroundStepOutput from './PlaygroundStepOutput';

import styles from './index.module.css';
import { SOURCES } from '../../../constants/index.ts';
import TaskDetails from './TaskDetails.jsx';
import { constructBuilder } from '../../../utils/playbooksData.ts';

const PlaygroundStep = ({ card, index }) => {
  const showOutput = card.showOutput;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <TaskDetails task={card} data={constructBuilder(card, index)} stepIndex={index} />

        <div>
          {showOutput && card.source !== SOURCES.TEXT && (
            <>
              <p className={styles['notesHeading']}>
                <b>Output</b>
              </p>
              {
                <div
                  className={
                    card.output?.data?.task_execution_result?.data_fetch_task_execution_result
                      ?.result?.table_result ||
                    card.output?.data?.task_execution_result?.metric_task_execution_result?.result
                      ?.table_result
                      ? styles['output-grid-table']
                      : styles['output-grid']
                  }
                >
                  {[card.output].map((output, index) => {
                    return (
                      <div className={styles['output-box']}>
                        <PlaygroundStepOutput
                          key={index}
                          stepOutput={output}
                          error={card.outputError}
                        />
                      </div>
                    );
                  })}
                </div>
              }
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PlaygroundStep;
