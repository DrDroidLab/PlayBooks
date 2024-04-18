/* eslint-disable react-hooks/exhaustive-deps */
import { useParams } from 'react-router-dom';
import Heading from '../Heading';
import API from '../../API';
import { useEffect, useState } from 'react';

import { renderTimestamp } from '../../utils/DateUtils';

import styles from './index.module.css';

import SuspenseLoader from '../Skeleton/SuspenseLoader';
import TableSkeleton from '../Skeleton/TableLoader';

import PlayBookRunMetricGraph from './PlayBookRunMetricGraph';

const PlayBookRunLogs = () => {
  const { playbook_run_id } = useParams();

  const [loading, setLoading] = useState(true);

  const [playbookRun, setPlaybookRun] = useState({});
  const [playbook, setPlaybook] = useState({});

  const getPlaybookRunLogs = API.useGetPlaybooksRunLogs();

  useEffect(() => {
    if (loading) {
      getPlaybookRunLogs(
        { playbook_run_id: playbook_run_id },
        response => {
          if (response.data?.playbook_run) {
            setPlaybookRun(response.data.playbook_run);
            setPlaybook(response.data.playbook);
          }
          setLoading(false);
        },
        err => {
          setLoading(false);
        }
      );
    }
  }, [loading]);

  const renderMetric = metric_log => {
    return (
      <div className={styles['pbRunLogMetrics']}>
        <span className="text-gray-500 text-xs leading-4 mr-2">Metric -&gt;</span>
        <span className={styles['pbRunLogDesc']}>
          <b>{metric_log.metric_expression}</b>
        </span>
        {metric_log.timeseries ? (
          <>
            <PlayBookRunMetricGraph tsData={metric_log.timeseries} unit={metric_log.unit} />
          </>
        ) : (
          ''
        )}
      </div>
    );
  };

  return (
    <div>
      <Heading
        heading={(playbook.name ? playbook.name + ' - ' : '') + 'Playbook Run - ' + playbook_run_id}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
      />
      <SuspenseLoader loading={!!loading} loader={<TableSkeleton />}>
        <div className={styles['pbRunSummary']}>
          <div>
            <span className="text-gray-500 text-xs leading-4 mr-2">Run ID -&gt;</span>
            <span className="text-gray-500 text-xs leading-4 mr-2">
              <b>{playbook_run_id}</b>
            </span>
          </div>

          <div>
            <span className="text-gray-500 text-xs leading-4 mr-2">Run at -&gt;</span>
            <span className="text-gray-500 text-xs leading-4 mr-2">
              <b>{renderTimestamp(playbookRun.started_at)}</b>
            </span>
          </div>

          <div>
            <span className="text-gray-500 text-xs leading-4 mr-2">Status -&gt;</span>
            <span className={styles['status-chip-' + playbookRun.status]}>
              {playbookRun.status}
            </span>
          </div>
        </div>

        {playbookRun.logs ? (
          <>
            <span className={styles['pbRunLogsTitle']}>Execution Logs</span>

            {playbookRun.logs.map((log, index) => (
              <div className={styles['pbRunLog']}>
                <div>
                  <span className="text-gray-500 text-xs leading-4 mr-2">Log Title -&gt;</span>
                  <span className={styles['pbRunLogDesc']}>
                    <b>{JSON.parse(log.log).description}</b>
                  </span>
                </div>

                {JSON.parse(log.log).result ? renderMetric(JSON.parse(log.log).result) : ''}

                {JSON.parse(log.log).results
                  ? JSON.parse(log.log).results.map((res, index) => renderMetric(res))
                  : ''}
              </div>
            ))}
          </>
        ) : (
          ''
        )}
      </SuspenseLoader>
    </div>
  );
};

export default PlayBookRunLogs;
