/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useState, useEffect } from 'react';
import API from '../../API';
import Heading from '../Heading';
import { SearchComponent } from '../SearchComponent';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Tooltip from '@mui/material/Tooltip';

import PlayBookRunMetricGraph from './PlayBookRunMetricGraph';

import { debounce } from '../../utils/utils';

import { CircularProgress, Button } from '@mui/material';

import dayjs from 'dayjs';

import styles from './index.module.css';

function reduceAndTruncateString(inputString, finalSize, desiredTokens) {
  const tokens = inputString.split(' ');
  const maxTokens = Math.min(desiredTokens, tokens.length);
  const truncatedString = tokens.slice(0, maxTokens).join(' ');

  if (truncatedString.length < inputString.length) {
    return truncatedString.slice(0, finalSize - 3) + '...';
  } else {
    return truncatedString;
  }
}

const LeftPaneItem = ({ item, onItemClick, selectedItem }) => {
  const { id, alert_title, alert_type, slack_channel, alert_timestamp } = item;

  const handleClick = () => {
    onItemClick(item);
  };

  return (
    <div
      className={
        selectedItem && id === selectedItem.id
          ? styles['alert-card-selected']
          : styles['alert-card']
      }
      onClick={handleClick}
    >
      <p className={styles['alert-title']}>{reduceAndTruncateString(alert_title, 120, 10)}</p>
      <p className={styles['alert-type']}>{alert_type}</p>
      <p className={styles['alert-channel']}>#{slack_channel.channel_name}</p>
      <p className={styles['alert-timestamp']}>
        {dayjs.unix(alert_timestamp).format('DD MMM, hh:mm a')}
      </p>
    </div>
  );
};

const IL = ({ il, selectedAlert, index }) => {
  const labelMapping = {
    application_metrics: 'Application Metrics',
    system_metrics: 'System Metrics',
    external_logs: 'External Logs',
    container_metrics: 'Container Metrics',
    latency_metric: 'Latency',
    error_metric: 'Error Rate',
    throughput_metric: 'Throughput',
    custom_metric: 'Custom Metrics',
    self: 'same',
    cpu_metric: 'CPU',
    memory_metric: 'Memory',
    topic_level_message_count: 'Topic Level Message Count',
    infra_metrics: 'Infrastructure Metrics',
    disk_metric: 'Disk',
    hit_rate_metric: 'Hit Rate'
  };

  const [executionTriggered, setExecutionTriggered] = useState(false);
  const [executionLoading, setExecutionLoading] = useState(false);
  const [executionOutput, setExecutionOutput] = useState();

  const executeAlertsInvestigationLogic = API.useExecuteAlertsInvestigationLogic();

  function replaceLabel(label) {
    if (!label) {
      return '';
    }
    if (labelMapping[label]) {
      return labelMapping[label];
    }
    return label;
  }

  function handleActionClick(il, index) {
    // console.log(il);
    setExecutionTriggered(true);
    setExecutionLoading(true);
    setExecutionOutput(null);

    if (selectedAlert.id === '89267') {
      setTimeout(() => {
        setExecutionOutput({
          is_timeseries: true,
          investigation_summary: 'p95 Latency for /connectors/list POST api',
          ts_data: JSON.parse(
            '{"result": {"unit": "milliseconds", "timeseries": [{"ts": 1704714330000, "val": 25.98}, {"ts": 1704714630000, "val": 28.71}, {"ts": 1704714930000, "val": 35.98}, {"ts": 1704715230000, "val": 21.50}, {"ts": 1704715530000, "val": 42.5}, {"ts": 1704715830000, "val": 33.9}], "metric_expression": "p95:trace.django.request{env:prod,service:prototype}"}, "description": "p95 for /connectors/list POST api", "process_function": "timeseries"}'
          )
        });
        setExecutionLoading(false);
      }, 1000);
    } else {
      executeAlertsInvestigationLogic(
        {
          alert_id: selectedAlert.id,
          alert_type: selectedAlert.alert_type,
          investigation_logics: [il]
        },
        res => {
          console.log(res.data);
          setExecutionOutput(res.data);
          setExecutionLoading(false);
        },
        err => {
          console.error('Error executing action:', err);
          setExecutionLoading(false);
        }
      );
    }
  }

  if (selectedAlert.alert_type === 'Sentry') {
    let il_message = 'Check external logs';
    if (il.search_query) {
      for (let i = 0; i < il.search_query.length; i++) {
        let query = il.search_query[i];
        if (query.key !== 'timestamp' && query.value) {
          il_message += ` for ${query.key} = ${query.value}`;
        }
      }
    }

    return (
      <div key={index} className={styles['il-card']}>
        <div className={styles['il-step-section']}>
          <div className={styles['il-step-name']}>
            <p className={styles['il-message']}>
              <b>Step - {index + 1}</b>
            </p>
          </div>
          <div className={styles['il-step-info']}>
            <p className={styles['il-message']} style={{ minWidth: '450px' }}>
              {il_message}
            </p>
            <Button>
              <Tooltip title="Edit">
                <EditIcon />
              </Tooltip>
            </Button>
            <Button>
              <Tooltip title="Add Another Step">
                <AddIcon />
              </Tooltip>
            </Button>
          </div>
          <Button onClick={() => handleActionClick(il, index)}>
            <Tooltip title="Run">
              Run
              <PlayArrowIcon />
            </Tooltip>
          </Button>
        </div>
        {executionTriggered && (
          <div className={styles['il-output-section']}>
            {executionLoading ? (
              <div className={styles['il-output-loading']}>
                <CircularProgress />
              </div>
            ) : (
              executionOutput && (
                <div className={styles['il-output']}>
                  <p className={styles['alert-title']}>Output Summary:</p>
                  <p className={styles['alert-type']}>{executionOutput.investigation_summary}</p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  } else {
    const { traversal, component_type, category, metric_type } = il;
    let il_message = `Check ${replaceLabel(category)} for ${replaceLabel(traversal)} ${replaceLabel(
      component_type
    )}`;

    return (
      <div key={index} className={styles['il-card']}>
        <div className={styles['il-step-section']}>
          <div className={styles['il-step-name']}>
            <p className={styles['il-message']}>
              <b>Step - {index + 1}</b>
            </p>
          </div>
          <div className={styles['il-step-info']}>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: '450px' }}>
              <p className={styles['il-message']}>{il_message}</p>
              <ul>
                {metric_type?.map((mt, index) => (
                  <p className={styles['il-message']}>- {replaceLabel(mt)}</p>
                ))}
              </ul>
            </div>
            <Button>
              <Tooltip title="Edit">
                <EditIcon />
              </Tooltip>
            </Button>
            <Button>
              <Tooltip title="Add Another Step">
                <AddIcon />
              </Tooltip>
            </Button>
          </div>
          <Button onClick={() => handleActionClick(il, index)}>
            <Tooltip title="Run">
              Run
              <PlayArrowIcon />
            </Tooltip>
          </Button>
        </div>
        {executionTriggered && (
          <div className={styles['il-output-section']}>
            {executionLoading ? (
              <div className={styles['il-output-loading']}>
                <CircularProgress />
              </div>
            ) : (
              executionOutput && (
                <div className={styles['il-output']}>
                  <p className={styles['alert-title']}>Output Summary:</p>
                  <p className={styles['alert-type']}>{executionOutput.investigation_summary}</p>
                  {executionOutput.is_timeseries && (
                    <>
                      <PlayBookRunMetricGraph
                        tsData={executionOutput.ts_data.result.timeseries}
                        unit={executionOutput.ts_data.result.unit}
                      />
                    </>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  }
};

const RightPane = ({ loading, selectedAlert, investigationLogics }) => {
  // Placeholder component for the right pane
  return loading ? (
    <div className={styles['alert-loading']}>
      <CircularProgress />
    </div>
  ) : (
    <div>
      {selectedAlert ? (
        <div className={styles['il-alert-details']}>
          <p className={styles['alert-title']}>{selectedAlert.alert_title}</p>
          <p className={styles['alert-type']}>
            {selectedAlert.alert_type} / #{selectedAlert.slack_channel.channel_name}
          </p>
          <div className={styles['alert-tags']}>
            {selectedAlert.alert_tags ? (
              <>
                {selectedAlert.alert_tags.map((tag, index) => (
                  <>
                    {tag.value.length < 25 && (
                      <div className={styles['alert-tag']}>
                        {tag.key}: {tag.value}
                      </div>
                    )}
                  </>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>
          <p className={styles['alert-timestamp']}>
            {dayjs.unix(selectedAlert.alert_timestamp).format('DD MMM, hh:mm a')}
          </p>
          <br></br>
          {investigationLogics && investigationLogics.length > 0 ? (
            <>
              <h3 className={styles['alert-title']}>Investigation Playbook</h3>
              {investigationLogics.map((il, index) => (
                <IL il={il} selectedAlert={selectedAlert} index={index} />
              ))}
            </>
          ) : (
            <div className={styles['alert-not-selected']}>
              <p>No Playbook found for this alert</p>
            </div>
          )}
        </div>
      ) : (
        <div className={styles['alert-not-selected']}>
          <p>No Alert selected</p>
        </div>
      )}
    </div>
  );
};

const Explore = () => {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [searchAlertTitleString, setSearchAlertTitleString] = useState('');
  const [searchAlerts, setSearchAlerts] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [investigationLogicsLoading, setInvestigationLogicsLoading] = useState(false);
  const [investigationLogics, setInvestigationLogics] = useState([]);

  const alertSearchOptions = [
    {
      id: 'SLACK_ALERT',
      label: 'Alert Title'
    }
  ];

  const getSlackAlertsSearch = API.useGetSlackAlertsSearch();
  const getAlertsInvestigationLogic = API.useGetAlertsInvestigationLogic();

  useEffect(() => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    setAlertsLoading(true);
    getSlackAlertsSearch(
      {
        use_db_source_tags: true,
        timeRange: { time_geq: currentTimestamp - 86400 * 8, time_lt: currentTimestamp },
        meta: {
          page: {
            limit: 25,
            offset: 0
          }
        }
      },
      res => {
        setAlerts(res.data.slack_alerts);
        setAlertsLoading(false);
      },
      err => {
        console.error('Error fetching data:', err);
        setAlertsLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (searchAlerts) {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      setAlertsLoading(true);
      getSlackAlertsSearch(
        {
          use_db_source_tags: true,
          fuzzy_search_request: {
            context: 'SLACK_ALERT',
            pattern: searchAlertTitleString
          },
          timeRange: { time_geq: currentTimestamp - 86400 * 8, time_lt: currentTimestamp },
          meta: {
            page: {
              limit: 25,
              offset: 0
            }
          }
        },
        res => {
          setAlerts(res.data.slack_alerts);
          setSearchAlerts(false);
          setAlertsLoading(false);
        },
        err => {
          console.error('Error fetching data:', err);
          setSearchAlerts(false);
          setAlertsLoading(false);
        }
      );
    }
  }, [searchAlerts]);

  const handleSearchChange = useCallback(searchValue => {
    setSearchAlertTitleString(searchValue);
    setSearchAlerts(true);
  }, []);

  const debouncedSearch = useCallback(() => debounce(handleSearchChange, 500), []);

  useEffect(() => {
    debouncedSearch();
  }, [searchAlertTitleString]);

  useEffect(() => {
    if (selectedAlert) {
      setInvestigationLogicsLoading(true);
      setInvestigationLogics([]);
      getAlertsInvestigationLogic(
        {
          alert_id: selectedAlert.id,
          alert_type: selectedAlert.alert_type
        },
        res => {
          setInvestigationLogics(res.data.investigation_logics);
          setInvestigationLogicsLoading(false);
        },
        err => {
          console.error('Error fetching data:', err);
          setInvestigationLogicsLoading(false);
        }
      );
    }
  }, [selectedAlert]);

  const handleItemClick = alert => {
    setSelectedAlert(alert);
  };

  return (
    <div>
      <Heading heading={'Playbooks (Beta)'} onTimeRangeChangeCb={false} onRefreshCb={false} />
      <div className={styles['pb-explore-title']}>
        <p>Click on an alert to view its investigation playbook</p>
      </div>
      <div className={styles['pb-explore-container']}>
        <div className={styles['alert-cards-pane']}>
          <div className={styles['alert-search-field']}>
            <SearchComponent
              style={{ width: '100%' }}
              selectDisabled
              options={alertSearchOptions}
              selectedType={alertSearchOptions[0].id}
              inputPlaceholder={'Search for alert title...'}
              onSearchChange={debouncedSearch()}
            />
          </div>
          {alertsLoading ? (
            <div className={styles['alert-loading']}>
              <CircularProgress />
            </div>
          ) : (
            <div>
              {alerts &&
                alerts.map(item => (
                  <LeftPaneItem
                    key={item.id}
                    item={item}
                    onItemClick={handleItemClick}
                    selectedItem={selectedAlert}
                  />
                ))}
            </div>
          )}
        </div>
        <div className={styles['alert-actions-pane']}>
          <RightPane
            loading={investigationLogicsLoading}
            selectedAlert={selectedAlert}
            investigationLogics={investigationLogics}
          />
        </div>
      </div>
    </div>
  );
};

export default Explore;
