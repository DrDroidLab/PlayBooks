import React, { useEffect } from 'react';
import Heading from '../../../components/Heading';
import styles from './index.module.css';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import InsightOptions from '../InsightOptions';
import AlertsByChannel from '../AlertsByChannel';
import AlertsByAlertTypes from '../AlertsByAlertTypes';
import MostFrequentAlerts from '../MostFrequentAlerts';
import MostFrequentAlertDistribution from '../MostFrequentAlertDistribution';
import AlertDistributionByTags from '../AlertDistributionByTags';
import AQSSection from './AQSSection';
import { CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import {
  useGetAlertOptionsPlaygroundQuery,
  useLazyGetAlertDistributionByAlertTypePlaygroundQuery,
  useLazyGetAlertDistributionByChannelPlaygroundQuery,
  useLazyGetAlertMetricPlaygroundQuery,
  useLazyGetAlertTagsPlaygroundQuery,
  useLazyGetMostAlertingEntitiesByToolPlaygroundQuery,
  useLazyGetMostFrequentAlertDistributionPlaygroundQuery,
  useLazyGetMostFrequentAlertPlaygroundQuery,
  useLazyGetSlackAlertMetricPlaygroundQuery
} from '../../../store/features/alertInsightsPlayground/apis/index.ts';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectedActiveChannelsSelector,
  selectedAlertTypesSelector,
  setSelectedActiveChannels,
  setSelectedAlertTypes
} from '../../../store/features/alertInsightsPlayground/alertInsightsPlaygroundSlice.ts';
import SlackAlertMetricTable from './SlackAlertMetricTable.jsx';
import { cardsData } from '../../../utils/cardsData.js';

const SampleReport = () => {
  const dispatch = useDispatch();
  const { data: alertOptionsData, isFetching: alertOptionsLoading } =
    useGetAlertOptionsPlaygroundQuery();
  const selectedActiveChannels = useSelector(selectedActiveChannelsSelector);
  const selectedAlertTypes = useSelector(selectedAlertTypesSelector);

  const [triggerAlertsByChannel, { data: alertsByChannel, isFetching: alertsByChannelLoading }] =
    useLazyGetAlertDistributionByChannelPlaygroundQuery();
  const [
    triggerAlertsByAlertType,
    { data: alertsByAlertType, isFetching: alertsByAlertTypeLoading }
  ] = useLazyGetAlertDistributionByAlertTypePlaygroundQuery();
  const [triggerToolAlertingEntities, { data: toolAlertingEntities }] =
    useLazyGetMostAlertingEntitiesByToolPlaygroundQuery();
  const [triggerFrequentAlerts, { data: frequentAlerts, frequentAlertsLoading }] =
    useLazyGetMostFrequentAlertPlaygroundQuery();
  const [
    triggerMostFrequentAlert,
    { data: mostFrequentAlert, isLoading: mostAlertingEntitiesLoading }
  ] = useLazyGetMostFrequentAlertDistributionPlaygroundQuery();
  const [triggerAlertTagOptions, { data: alertTagOptions, isFetching: alertTagOptionsLoading }] =
    useLazyGetAlertTagsPlaygroundQuery();
  const [triggerAlertMetricMap, { data: alertMetricMap, isFetching: alertMetricMapLoading }] =
    useLazyGetAlertMetricPlaygroundQuery();
  const [
    triggerSlackAlertMetrics,
    { data: slackAlertMetrics, isFetching: slackAlertMetricsLoading }
  ] = useLazyGetSlackAlertMetricPlaygroundQuery();

  const fetchData = async () => {
    const payload = {
      filter_channels: selectedActiveChannels.map(({ label }) => label),
      filter_alert_types: selectedAlertTypes.map(({ label }) => label)
    };
    const promises = [];
    promises.push(
      ...[
        triggerSlackAlertMetrics(payload),
        triggerAlertsByChannel(payload),
        triggerAlertsByAlertType(payload),
        triggerToolAlertingEntities(payload),
        triggerFrequentAlerts(payload),
        triggerMostFrequentAlert(payload),
        triggerAlertTagOptions(payload),
        triggerAlertMetricMap(payload)
      ]
    );

    Promise.allSettled(promises);
  };

  useEffect(() => {
    if (selectedActiveChannels && selectedAlertTypes) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedActiveChannels, selectedAlertTypes]);

  const handleAlertTypeChange = (_, selectedOptions, reason) => {
    if (reason === 'selectOption') {
      const counts = {};
      let filtered;
      const ids = selectedOptions.map(({ id }) => id);
      ids.forEach(function (x) {
        counts[x] = (counts[x] || 0) + 1;
      });
      const duplicateId = Object.entries(counts).filter(([key, value]) => value > 1)[0];
      if (duplicateId) {
        filtered = selectedOptions.filter(({ id }, index) => id !== duplicateId[0]);
      } else {
        filtered = selectedOptions;
      }
      dispatch(setSelectedAlertTypes(filtered));
      return;
    }
    dispatch(setSelectedAlertTypes(selectedOptions));
  };

  const handleActiveChannelChange = (_, selectedOptions, reason) => {
    if (reason === 'selectOption') {
      const counts = {};
      let filtered;
      const ids = selectedOptions.map(({ id }) => id);
      ids.forEach(function (x) {
        counts[x] = (counts[x] || 0) + 1;
      });
      const duplicateId = Object.entries(counts).filter(([key, value]) => value > 1)[0];
      if (duplicateId) {
        filtered = selectedOptions.filter(({ id }, index) => id !== duplicateId[0]);
      } else {
        filtered = selectedOptions;
      }
      dispatch(setSelectedActiveChannels(filtered));
      return;
    }
    dispatch(setSelectedActiveChannels(selectedOptions));
  };

  if (alertOptionsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={styles['container']}>
      <Heading heading={'Sample Report'} onTimeRangeChangeCb={fetchData} onRefreshCb={fetchData} />
      <div className={styles['cardsContainer']}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ textAlign: 'left', fontSize: '20px', fontWeight: 800 }}>
            This report is generated with just using Doctor Droid Slack bot.
          </div>
          <div style={{ textAlign: 'left', fontSize: '15px' }}>No other integrations required.</div>
        </div>
        <span style={{ order: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div>
              <div>
                <a
                  href={cardsData.find(card => card.enum === 'SLACK').buttonLink}
                  rel="noreferrer"
                  target="_blank"
                >
                  <div className={styles['connectionLink']}>Get Started</div>
                </a>
              </div>
            </div>
          </div>
        </span>
      </div>

      {alertOptionsData?.activeChannels.length === 0 && (
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
      {alertOptionsData?.activeChannels.length > 0 && alertOptionsData?.alertTypes.length === 0 && (
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
              rel="noreferrer"
              target="_blank"
            >
              puzzle
            </a>{' '}
          </div>
        </>
      )}
      {alertOptionsData?.activeChannels.length > 0 && alertOptionsData?.alertTypes.length > 0 && (
        <>
          <div className={styles['optionsContainer']}>
            <InsightOptions
              alertTypes={alertOptionsData?.alertTypes}
              activeChannels={alertOptionsData?.activeChannels}
              selectedActiveChannels={selectedActiveChannels}
              selectedAlertTypes={selectedAlertTypes}
              onActiveChannel={handleActiveChannelChange}
              onAlertType={handleAlertTypeChange}
            />
          </div>
          <div className={styles['insightsContainer']}>
            <AQSSection activeChannels={selectedActiveChannels} />

            <SlackAlertMetricTable data={slackAlertMetrics} isFetching={slackAlertMetricsLoading} />

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
                    {toolAlertingEntities?.length > 0 ? (
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
              <div
                style={{ width: '49%' }}
                className={alertsByChannelLoading ? 'flex justify-center items-center' : ''}
              >
                {alertsByChannelLoading && <CircularProgress />}
                <AlertsByChannel {...alertsByChannel} />
              </div>
              <div style={{ width: '2%' }}></div>
              <div
                style={{ width: '49%' }}
                className={alertsByChannelLoading ? 'flex justify-center items-center' : ''}
              >
                {alertsByAlertTypeLoading && <CircularProgress />}
                <AlertsByAlertTypes {...alertsByAlertType} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div
                style={{ width: '49%' }}
                className={alertsByChannelLoading ? 'flex justify-center items-center' : ''}
              >
                {frequentAlertsLoading && <CircularProgress />}
                <MostFrequentAlerts {...frequentAlerts} />
              </div>
              <div style={{ width: '2%' }}></div>
              <div
                style={{ width: '49%' }}
                className={alertsByChannelLoading ? 'flex justify-center items-center' : ''}
              >
                {mostAlertingEntitiesLoading && <CircularProgress />}
                <MostFrequentAlertDistribution {...mostFrequentAlert} />
              </div>
            </div>
            <div className={alertsByChannelLoading ? 'flex justify-center items-center' : ''}>
              {alertTagOptionsLoading && alertMetricMapLoading && <CircularProgress />}
              <AlertDistributionByTags metric_map={alertMetricMap} tag_options={alertTagOptions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SampleReport;
