/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import Heading from '../../components/Heading';
import styles from './index.module.css';
import apis from '../../API';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import InsightOptions from './InsightOptions';
import AlertsByChannel from './AlertsByChannel';
import AlertsByAlertTypes from './AlertsByAlertTypes';
import MostFrequentAlerts from './MostFrequentAlerts';
import MostFrequentAlertDistribution from './MostFrequentAlertDistribution';
import AlertDistributionByTags from './AlertDistributionByTags';
import AQSSection from './AQSSection';
import { transformForScatterPlot, transformToGraphOptions, integrationURLMapping } from './utils';

import { CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import SlackAlertMetricTable from './SlackAlertMetricTable';

const Report = () => {
  const [activeChannels, setActiveChannels] = useState([]);
  const [alertTypes, setAlertTypes] = useState([]);
  const [, setConnectedIntegrations] = useState([]);
  const [pendingIntegrations, setPendingIntegrations] = useState([]);
  const [selectedActiveChannels, setSelectedActiveChannels] = useState([]);
  const [selectedAlertTypes, setSelectedAlertTypes] = useState([]);
  const [alertsByChannel, setAlertsByChannel] = useState();
  const [frequentAlerts, setFrequentAlerts] = useState();
  const [alertsBYAlertType, setAlertsByAlertType] = useState();
  const [mostFrequentAlert, setMostFrequentAlert] = useState();
  const [alertMetricMap, setAlertMetricMap] = useState({});
  const [alertTagOptions, setAlertTagOptions] = useState([]);
  const [toolAlertingEntities, setToolAlertingEntities] = useState([]);

  const [mostAlertingEntitiesLoading, setMostAlertingEntitiesLoading] = useState(false);

  const alertOptions = apis.useGetAlertOptions();
  const alertDistributionByChannel = apis.useGetAlertDistributionByChannel();
  const alertDistributionByAlertType = apis.useGetAlertDistributionByAlertType();
  const alertMostFrequent = apis.useGetAlertMostFrequent();
  const mostFrequentAlertDistribution = apis.useMostFrequentAlertDistribution();
  const getAlertMetric = apis.useGetAlertMetric();
  const getAlertTagOptions = apis.useGetAlertTagOptions();
  const getConnectedIntegrations = apis.useGetConnectedIntegrations();
  const getMostAlertingEntities = apis.useGetMostAlertingEntities();

  const updateAlertTagOptions = tag_options => {
    if (tag_options) {
      const filtered_tag_options = tag_options.comm_options.workspaces[0].alert_tags.filter(
        tag_option => {
          const { active_channel_id, alert_type_id } = tag_option;
          const is_active_channel = selectedActiveChannels.find(
            ({ id }) => id === active_channel_id
          );
          const is_alert_type = selectedAlertTypes.find(({ id }) => id === alert_type_id);
          return is_active_channel && is_alert_type;
        }
      );

      const enriched_filtered_tag_options = filtered_tag_options.map(tag_option => {
        const { active_channel_id, alert_type_id, alert_tag } = tag_option;
        const active_channel_label = selectedActiveChannels.find(
          ({ id }) => id === active_channel_id
        ).label;
        const alert_type_label = selectedAlertTypes.find(({ id }) => id === alert_type_id).label;
        return {
          ...tag_option,
          active_channel_label: active_channel_label,
          alert_type_label: alert_type_label,
          label: alert_tag
        };
      });

      setAlertTagOptions(enriched_filtered_tag_options);
    } else {
      setAlertTagOptions([]);
    }
  };

  const loadingCb = () => {
    const payload = {
      filter_channels: selectedActiveChannels.map(({ label }) => label),
      filter_alert_types: selectedAlertTypes.map(({ label }) => label)
    };
    alertDistributionByChannel(
      payload,
      res => {
        const { data } = res;
        const graphOptions = transformToGraphOptions(data);
        setAlertsByChannel(graphOptions);
      },
      err => {
        console.error(err);
      }
    );
    alertDistributionByAlertType(
      payload,
      res => {
        const { data } = res;
        const graphOptions = transformToGraphOptions(data);
        setAlertsByAlertType(graphOptions);
      },
      err => {
        console.error(err);
      }
    );

    alertMostFrequent(
      payload,
      res => {
        const { data } = res;
        const graphOptions = transformToGraphOptions(data);
        setFrequentAlerts(graphOptions);
      },
      err => {
        console.error(err);
      }
    );
    mostFrequentAlertDistribution(
      payload,
      res => {
        const { data } = res;
        const graphOptions = transformForScatterPlot(data);
        setMostFrequentAlert(graphOptions);
      },
      err => {
        console.error(err);
      }
    );

    getAlertTagOptions(
      payload,
      res => {
        const { data } = res;
        updateAlertTagOptions(data.alert_ops_options);
      },
      err => {
        console.error(err);
      }
    );

    // Create a new payload for the metric with additional fields
    const metricPayload = {
      ...payload,
      metric_title: 'ALERT_DISTRIBUTION_BY_ALERT_TAG',
      metric_name: 'ALERT_DISTRIBUTION_BY_ALERT_TAG'
    };
    getAlertMetric(
      metricPayload,
      res => {
        const { data } = res;
        setAlertMetricMap(data.metric_map);
      },
      err => {
        console.error(err);
      }
    );
  };

  useEffect(() => {
    alertOptions(
      {
        connector_type_requests: [
          {
            connector_type: 'SLACK'
          },
          {
            connector_type: 'GOOGLE_CHAT'
          }
        ]
      },
      res => {
        const data = res?.data;
        const { alert_ops_options } = data;
        const { comm_options } = alert_ops_options;
        const { workspaces } = comm_options;
        const { active_channels, alert_types } = workspaces[0];
        if (active_channels) {
          const activeChannels = active_channels?.map(channel => {
            const { channel_name, id } = channel;
            return {
              label: channel_name,
              id: id
            };
          });
          setActiveChannels(activeChannels);
          setSelectedActiveChannels(activeChannels);
        }
        if (alert_types) {
          const filteredAlertAlertType = alert_types.filter(
            (value, index, self) => index === self.findIndex(t => t.alert_type === value.alert_type)
          );
          const alertTypes = filteredAlertAlertType
            ?.map(alertType => {
              const { alert_type, id } = alertType;
              return {
                label: alert_type,
                id: id
              };
            })
            .filter(({ label }) => label !== 'Not an alert');
          setAlertTypes(alertTypes);
          setSelectedAlertTypes(alertTypes);
        }
      },
      err => {
        console.error(err);
      }
    );

    getConnectedIntegrations(
      {},
      res => {
        const data = res?.data;
        const { connected_integrations, pending_integrations } = data;
        setConnectedIntegrations(connected_integrations);
        setPendingIntegrations(pending_integrations);
      },
      err => {
        console.error(err);
      }
    );
  }, []);

  useEffect(() => {
    const payload = {
      filter_channels: selectedActiveChannels.map(({ label }) => label),
      filter_alert_types: selectedAlertTypes.map(({ label }) => label)
    };
    const currentTimestamp = Math.floor(Date.now() / 1000);
    setMostAlertingEntitiesLoading(true);
    getMostAlertingEntities(
      {
        ...payload,
        threshold: 9,
        timeRange: { time_geq: currentTimestamp - 1209600, time_lt: currentTimestamp }
      },
      res => {
        const { data } = res;
        if (!data.tool_alerting_entities) {
          setToolAlertingEntities([]);
        } else {
          let processed_data = data.tool_alerting_entities.sort(function (a, b) {
            return parseInt(b['frequency']) - parseInt(a['frequency']);
          });

          processed_data.forEach(item => {
            const metadata_dict = {};
            item.alert_entity_resource_metadata.forEach(item => {
              metadata_dict[item.key] = item.value;
            });
            item.metadata = JSON.stringify(metadata_dict);
          });

          setToolAlertingEntities(processed_data);
        }
        setMostAlertingEntitiesLoading(false);
      },
      err => {
        console.error(err);
        setMostAlertingEntitiesLoading(false);
      }
    );
    alertDistributionByChannel(
      payload,
      res => {
        const { data } = res;
        const graphOptions = transformToGraphOptions(data);
        setAlertsByChannel(graphOptions);
      },
      err => {
        console.error(err);
      }
    );
    alertDistributionByAlertType(
      payload,
      res => {
        const { data } = res;
        const graphOptions = transformToGraphOptions(data);
        setAlertsByAlertType(graphOptions);
      },
      err => {
        console.error(err);
      }
    );

    alertMostFrequent(
      payload,
      res => {
        const { data } = res;
        const graphOptions = transformToGraphOptions(data);
        setFrequentAlerts(graphOptions);
      },
      err => {
        console.error(err);
      }
    );
    mostFrequentAlertDistribution(
      payload,
      res => {
        const { data } = res;
        const graphOptions = transformForScatterPlot(data);
        setMostFrequentAlert(graphOptions);
      },
      err => {
        console.error(err);
      }
    );

    getAlertTagOptions(
      payload,
      res => {
        const { data } = res;
        updateAlertTagOptions(data.alert_ops_options);
      },
      err => {
        console.error(err);
      }
    );

    // Create a new payload for the metric with additional fields
    const metricPayload = {
      ...payload,
      metric_title: 'ALERT_DISTRIBUTION_BY_ALERT_TAG',
      metric_name: 'ALERT_DISTRIBUTION_BY_ALERT_TAG'
    };
    getAlertMetric(
      metricPayload,
      res => {
        const { data } = res;
        setAlertMetricMap(data.metric_map);
      },
      err => {
        console.error(err);
      }
    );
  }, [selectedActiveChannels, selectedAlertTypes]);

  const handleAlertTypeChange = (event, selectedOptions, reason) => {
    if (reason === 'selectOption') {
      const counts = {};
      let filtered;
      const ids = selectedOptions.map(({ id }) => id);
      ids.forEach(function (x) {
        counts[x] = (counts[x] || 0) + 1;
      });
      const duplicateId = Object.entries(counts).filter(([_, value]) => value > 1)[0];
      if (duplicateId) {
        filtered = selectedOptions.filter(({ id }) => id !== duplicateId[0]);
      } else {
        filtered = selectedOptions;
      }
      setSelectedAlertTypes(filtered);
      return;
    }
    setSelectedAlertTypes(selectedOptions);
  };

  const handleActiveChannelChange = (event, selectedOptions, reason) => {
    if (reason === 'selectOption') {
      const counts = {};
      let filtered;
      const ids = selectedOptions.map(({ id }) => id);
      ids.forEach(function (x) {
        counts[x] = (counts[x] || 0) + 1;
      });
      const duplicateId = Object.entries(counts).filter(([_, value]) => value > 1)[0];
      if (duplicateId) {
        filtered = selectedOptions.filter(({ id }) => id !== duplicateId[0]);
      } else {
        filtered = selectedOptions;
      }
      setSelectedActiveChannels(filtered);
      return;
    }
    setSelectedActiveChannels(selectedOptions);
  };

  return (
    <div className={styles['container']}>
      <Heading heading={'Report'} onTimeRangeChangeCb={loadingCb} onRefreshCb={loadingCb} />

      {pendingIntegrations && pendingIntegrations.length > 0 && (
        <>
          <div className={styles['cardsContainer']}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ textAlign: 'left', fontSize: '20px', fontWeight: 800 }}>
                Add even more context into your insights
              </div>
              <div style={{ textAlign: 'left', fontSize: '15px' }}>
                Connect your observability tools for adding better correlation and tags to your
                alerts
              </div>
            </div>
            <span style={{ order: 2 }}>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                {pendingIntegrations.map((integration, index) => {
                  return (
                    <div key={index}>
                      <div>
                        {integrationURLMapping[integration] && index <= 2 && (
                          <a
                            href={integrationURLMapping[integration]}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <div className={styles['connectionLink']}>{integration}</div>
                          </a>
                        )}
                      </div>
                      &nbsp;
                    </div>
                  );
                })}
                {pendingIntegrations?.length > 3 && (
                  <div>
                    <a href="/integrations" target="_blank">
                      <div className={styles['connectionLink']}>See All</div>
                    </a>
                  </div>
                )}
              </div>
            </span>
          </div>
        </>
      )}

      {activeChannels.length === 0 && (
        <>
          <div
            style={{
              textAlign: 'center',
              marginTop: '50px',
              fontSize: '20px'
            }}
          >
            No Report Found.
          </div>
          <div
            style={{
              textAlign: 'center',
              fontSize: '20px'
            }}
          >
            Install & Add{' '}
            <a style={{ color: '#9553fe' }} href="/integrations" target="_blank">
              Dr Droid Slack app
            </a>{' '}
            to your alert channels to generate report.
          </div>
          <div
            style={{
              textAlign: 'center',
              fontSize: '20px'
            }}
          >
            See{' '}
            <a style={{ color: '#9553fe' }} href="/sample-insights" target="_blank">
              sample report
            </a>
          </div>
        </>
      )}
      {activeChannels.length > 0 && alertTypes.length === 0 && (
        <>
          <div
            style={{
              textAlign: 'center',
              marginTop: '50px',
              fontSize: '20px'
            }}
          >
            We are processing data for your channels.
          </div>
          <div
            style={{
              textAlign: 'center',
              fontSize: '20px'
            }}
          >
            Until then, check out the{' '}
            <a style={{ color: '#9553fe' }} href="/sample-insights" target="_blank">
              sample report
            </a>{' '}
            or play this{' '}
            <a
              style={{ color: '#9553fe' }}
              href="https://funfordevs.com"
              target="_blank"
              rel="noreferrer"
            >
              puzzle
            </a>{' '}
          </div>
        </>
      )}
      {activeChannels.length > 0 && alertTypes.length > 0 && (
        <>
          <div className={styles['optionsContainer']}>
            <InsightOptions
              alertTypes={alertTypes}
              activeChannels={activeChannels}
              selectedActiveChannels={selectedActiveChannels}
              selectedAlertTypes={selectedAlertTypes}
              onActiveChannel={handleActiveChannelChange}
              onAlertType={handleAlertTypeChange}
            />
          </div>
          <div className={styles['insightsContainer']}>
            <AQSSection activeChannels={selectedActiveChannels} />

            <SlackAlertMetricTable
              filter_alert_types={selectedAlertTypes}
              filter_channels={selectedActiveChannels}
            />

            <Accordion
              style={{ borderRadius: '5px' }}
              className="collapsible_option"
              defaultExpanded={false}
            >
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                style={{ borderRadius: '5px', backgroundColor: '#f5f5f5' }}
              >
                <Typography>
                  <b style={{ fontSize: '18px' }}>Most Repeated Alerts in last 2 weeks</b>{' '}
                  <i style={{ fontSize: '15px' }}>(Click to open/close)</i>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {mostAlertingEntitiesLoading ? (
                  <>
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '20px'
                      }}
                    >
                      <CircularProgress />
                    </div>
                  </>
                ) : (
                  <>
                    {toolAlertingEntities.length > 0 ? (
                      <>
                        <Typography>
                          <i style={{ fontSize: '12px', color: 'darkgray' }}>
                            These are alerts that were triggered on 9 or more days in the past 2
                            weeks
                          </i>
                        </Typography>
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell style={{ fontWeight: 800 }}>Channel Name</TableCell>
                              <TableCell style={{ fontWeight: 800 }}>Alert Source</TableCell>
                              <TableCell style={{ fontWeight: 800 }}>Count</TableCell>
                              <TableCell style={{ fontWeight: 800 }}>Alert Name</TableCell>
                              <TableCell style={{ fontWeight: 800 }}>Metadata</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {toolAlertingEntities?.map((item, index) => (
                              <TableRow
                                key={index}
                                sx={{
                                  '&:last-child td, &:last-child th': { border: 0 }
                                }}
                              >
                                <TableCell component="th" scope="row">
                                  {item.channel_name}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                  {item.alert_type}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                  {item.frequency}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                  {item.title}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                  {item.metadata}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </>
                    ) : (
                      <>
                        <div
                          style={{
                            textAlign: 'center',
                            fontSize: '20px'
                          }}
                        >
                          No Noisy Alerts found
                        </div>
                      </>
                    )}
                  </>
                )}
              </AccordionDetails>
            </Accordion>

            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div style={{ width: '49%' }}>
                <AlertsByChannel {...alertsByChannel} />
              </div>
              <div style={{ width: '2%' }}></div>
              <div style={{ width: '49%' }}>
                <AlertsByAlertTypes {...alertsBYAlertType} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div style={{ width: '49%' }}>
                <MostFrequentAlerts {...frequentAlerts} />
              </div>
              <div style={{ width: '2%' }}></div>
              <div style={{ width: '49%' }}>
                <MostFrequentAlertDistribution {...mostFrequentAlert} />
              </div>
            </div>
            <AlertDistributionByTags metric_map={alertMetricMap} tag_options={alertTagOptions} />
          </div>
        </>
      )}
    </div>
  );
};

export default Report;
