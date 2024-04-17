import { useState } from 'react';
import { Tooltip } from '@mui/material';
import styles from '../playbooks.module.css';
import { Launch } from '@mui/icons-material';
import Notes from './Notes.jsx';
import Query from './Query.jsx';
import { useDispatch } from 'react-redux';
import { changeProgress, updateStep } from '../../../store/features/playground/playgroundSlice.ts';
import { getTaskFromStep } from '../../../utils/stepsToplaybook.ts';
import { getStepTitle } from '../utils.js';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useExecutePlaygroundMutation } from '../../../store/features/playground/api/index.ts';

function Step({ step, index }) {
  const [addQuery, setAddQuery] = useState(step?.isPrefetched ?? false);
  const dispatch = useDispatch();
  const [triggerPlaygroundExecution] = useExecutePlaygroundMutation();

  const [outputs, setOutputs] = useState([]);

  const updateCardByIndex = (key, value) => {
    dispatch(
      updateStep({
        index,
        key,
        value
      })
    );
  };

  const queryForStepTask = async (step, cb) => {
    let body = {
      playbook_task_definition: getTaskFromStep(step)
    };

    if (Object.keys(body?.playbook_task_definition?.documentation_task ?? {}).length > 0) {
      cb(
        {
          step: step,
          data: null,
          timestamp: new Date().toTimeString(),
          title: getStepTitle(step)
        },
        true
      );
      return;
    }

    try {
      const res = await triggerPlaygroundExecution(body).unwrap();
      cb(
        {
          step: step,
          data: res,
          timestamp: new Date().toTimeString(),
          title: getStepTitle(step)
        },
        true
      );
    } catch (err) {
      updateCardByIndex('outputError', err.message);
      console.error(err?.message);
      cb({}, false);
    }
  };

  const handleExecute = () => {
    updateCardByIndex('outputLoading', true);
    updateCardByIndex('showOutput', true);
    updateCardByIndex('outputError', null);
    updateCardByIndex('output', null);

    queryForStepTask(step, function (res) {
      if (res) {
        setOutputs([res, ...outputs]);
        updateCardByIndex('showOutput', true);
        updateCardByIndex('output', res);
        updateCardByIndex('outputLoading', false);
      }

      changeCardExecutionProgressStatus(false);
    });
  };

  function changeCardExecutionProgressStatus(status) {
    dispatch(changeProgress({ index, status }));
  }

  return (
    <div className={styles['step-card']}>
      <div className={styles['step-card-content']} style={{ padding: '0px' }}>
        <div className={styles['step-name']}>
          <div className={styles.head}>
            <div className={styles.extLinks}>
              {step.externalLinks?.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.extLink}
                >
                  {link?.name || link.url} <Launch />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className={styles['step-section']}>
          {step.isPrefetched
            ? step.notes && (
                <div className={styles['addConditionStyle']}>
                  <b>Notes</b>
                </div>
              )
            : !step.isPlayground && (
                <div className={styles['addConditionStyle']}>
                  <b>Add note about this step</b>
                </div>
              )}
          <Notes step={step} index={index} />
          <div className={styles['step-info']}>
            {step.isPrefetched ? (
              step.source && (
                <div>
                  <div className={styles['addConditionStyle']} onClick={() => setAddQuery(true)}>
                    <b>{!addQuery ? '+ Add Data' : 'Data'}</b>
                  </div>

                  {addQuery && <Query step={step} index={index} />}
                </div>
              )
            ) : (
              <div>
                <div className={styles['addConditionStyle']} onClick={() => setAddQuery(true)}>
                  <b>{!addQuery ? '+ Add Data' : 'Data'}</b>
                </div>

                {addQuery && <Query step={step} index={index} />}
              </div>
            )}
          </div>
        </div>
        <div className={styles['step-buttons']}>
          {step.source && (
            <button
              className={`${styles['pb-button']} single_step`}
              onClick={() => handleExecute(index)}
            >
              <Tooltip title="Run this Step">
                Run <PlayArrowIcon />
              </Tooltip>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step;
