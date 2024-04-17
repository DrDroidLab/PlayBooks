import { useParams } from 'react-router-dom';
import Heading from '../Heading';
import { useEffect, useState } from 'react';

import SuspenseLoader from '../Skeleton/SuspenseLoader';
import TableSkeleton from '../Skeleton/TableLoader';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  playgroundSelector,
  resetState,
  setPlayground,
  setSteps,
  toggleStep,
  updateStep
} from '../../store/features/playground/playgroundSlice.ts';
import styles from './playbooks.module.css';
import { playbookToSteps } from '../../utils/playbookToSteps.ts';
import { getPlaygroundAssetModelOptions } from '../../store/features/playground/api/index.ts';
import Step from './steps/Step';
import {
  useExecutePlaygroundMutation,
  useGetPlaygroundQuery
} from '../../store/features/playground/api/index.ts';
import { getStepTitle } from '../Playbooks/utils.jsx';
import { getTaskFromStep } from '../../utils/stepsToplaybook.ts';
import PlaybookTitle from '../common/PlaybookTitle.jsx';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PlaygroundVariables from '../common/GlobalVariable/PlaygroundVariables.jsx';
import { resetTimeRange, setPlaybookState } from '../../store/features/timeRange/timeRangeSlice.ts';

const ViewPlayground = () => {
  const { playground_id } = useParams();
  const dispatch = useDispatch();
  const { steps } = useSelector(playgroundSelector);
  const { data: playgroundData, isFetching } = useGetPlaygroundQuery(playground_id);
  const [triggerPlaygroundExecution] = useExecutePlaygroundMutation();
  const [outputs, setOutputs] = useState([]);

  const updateCardByIndex = (index, key, value) => {
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
      console.error(err);
      cb(
        {
          error: err.message
        },
        false
      );
    }
  };

  const handleGlobalExecute = () => {
    const promises = steps.map((card, i) => {
      return new Promise((resolve, reject) => {
        updateCardByIndex(i, 'outputLoading', true);
        updateCardByIndex(i, 'showOutput', false);
        updateCardByIndex(i, 'outputError', null);
        updateCardByIndex(i, 'output', null);
        queryForStepTask(card, function (res, status) {
          if (res) {
            updateCardByIndex(i, 'outputError', res.error);
            updateCardByIndex(i, 'showOutput', true);
            updateCardByIndex(i, 'output', res);
            updateCardByIndex(i, 'outputLoading', false);
            resolve(res);
          } else {
            reject();
          }
        });
      });
    });

    Promise.all(promises).then(responses => {
      setOutputs(responses.concat(outputs));
    });
  };

  const populateData = () => {
    const data = playbookToSteps(playgroundData.playbooks[0]);
    const assetModelPromises = data.map((el, i) =>
      dispatch(
        getPlaygroundAssetModelOptions.initiate(
          {
            connector_type: el.source,
            model_type: el.modelType,
            stepIndex: i
          },
          {
            forceRefetch: true
          }
        )
      ).unwrap()
    );

    Promise.all(assetModelPromises).catch(err => {
      console.log('Error: ', err);
    });

    dispatch(setSteps(data));
  };

  useEffect(() => {
    dispatch(setPlaybookState());
    return () => {
      dispatch(resetState());
      dispatch(resetTimeRange());
    };
  }, [dispatch]);

  useEffect(() => {
    if (playgroundData?.playbooks[0]) {
      populateData();
      dispatch(setPlayground(playgroundData.playbooks[0]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playgroundData]);

  return (
    <div className="flex flex-col h-screen">
      <Heading
        heading={
          'Sample Playbook' +
          (playgroundData && playgroundData?.playbooks[0].name
            ? ' - ' + playgroundData?.playbooks[0].name
            : '')
        }
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
        showRunAll={true}
        handleGlobalExecute={handleGlobalExecute}
        customTimeRange={true}
        isPlayground={true}
      />
      <SuspenseLoader loading={!!isFetching} loader={<TableSkeleton />}>
        <div className={styles['pb-container']}>
          <div className={styles['global-variables-pane']}>
            <PlaygroundVariables />
          </div>
          <div className={styles['step-cards-pane']}>
            <div className={styles.steps}>
              {steps?.map((step, index) => (
                <Accordion
                  style={{ borderRadius: '5px' }}
                  className="collapsible_option"
                  defaultExpanded={step.isPrefetched ? false : true}
                  expanded={step.isOpen}
                  onChange={() => dispatch(toggleStep({ index }))}
                >
                  <AccordionSummary
                    expandIcon={<ArrowDropDownIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    style={{ borderRadius: '5px', backgroundColor: '#f5f5f5' }}
                  >
                    <PlaybookTitle
                      step={step}
                      index={index}
                      updateCardByIndex={updateCardByIndex}
                    />
                  </AccordionSummary>
                  <AccordionDetails sx={{ padding: '0' }}>
                    <Step key={index} step={step} index={index} />
                  </AccordionDetails>
                </Accordion>
              ))}
            </div>
          </div>
        </div>
      </SuspenseLoader>
    </div>
  );
};

export default ViewPlayground;
