import ReactECharts from 'echarts-for-react';
import styles from './index.module.css';
import { CircularProgress, Table, TableBody, TableCell, TableRow } from '@mui/material';
import {
  useGenerateAQSPlaygroundQuery,
  useGenerateAQSTrendsPlaygroundQuery
} from '../../../store/features/alertInsightsPlayground/apis/index.ts';

const AQSSection = ({ activeChannels }) => {
  const { data: aqsData, isFetching: dataLoading } = useGenerateAQSPlaygroundQuery({
    filter_channels: activeChannels?.map(e => e.label) ?? []
  });
  const { data: aqsTrends, isFetching: trendsLoading } = useGenerateAQSTrendsPlaygroundQuery({
    filter_channels: activeChannels?.map(channel => channel.label) ?? []
  });

  const aqsScore = aqsData?.aqsScore ?? [];
  const aqsChannelData = aqsData?.channelData ?? [];
  const channelAQSScores = aqsData?.aqsScores ?? [];

  return (
    <div>
      <h3 className={styles['aqs-title']}>
        <b>Alert Quality Score (AQS)</b>
        <span className={styles['aqs-subtitle']}>
          Frequency Score &#x2191; means Noise &#x2193;
        </span>
        <span className={styles['aqs-subtitle']}>
          Actionability Score &#x2191; means More unique alerts
        </span>
      </h3>
      {dataLoading && trendsLoading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div className={styles['aqs-block']}>
            <ReactECharts
              option={getOptionForGauge('Last 2 Weeks (All selected channels)', aqsScore)}
            />
          </div>
          <div className={styles['aqs-block']} style={{ overflowY: 'auto' }}>
            <p style={{ textAlign: 'center', fontSize: '14px' }}>
              <b>Channel Wise Score</b>
            </p>
            <Table>
              <TableBody>
                {aqsChannelData.map((data, index) => (
                  <TableRow style={{ fontSize: '10px' }}>
                    <TableCell style={{ maxWidth: '80px' }}>{data?.channel_name}</TableCell>
                    <TableCell style={{ maxWidth: '40px' }}>{data?.score} / 100</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className={styles['aqs-block'] + ' ' + styles['info-graph']}>
            <ReactECharts option={getOptionForGraph(channelAQSScores)} />
          </div>
          <div className={styles['aqs-block']}>
            <ReactECharts option={getOptionForTrend(aqsTrends?.dates, aqsTrends?.series)} />
          </div>
        </div>
      )}
    </div>
  );
};

const getOptionForGauge = (title, value) => {
  return {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: '14px'
      }
    },
    series: [
      {
        type: 'gauge',
        detail: { formatter: '{value}' },
        data: [{ value: value, name: 'Score' }]
      }
    ]
  };
};

const getOptionForGraph = channel_scores => {
  return {
    title: {
      text: 'Frequency vs Actionability for all Channels',
      top: 0,
      left: 'center',
      textStyle: {
        fontSize: '14px'
      }
    },
    xAxis: {
      type: 'value',
      name: 'Actionability Score -----------> ',
      nameLocation: 'middle',
      nameGap: 25
    },
    yAxis: {
      type: 'value',
      name: 'Frequency Score ------------> ',
      nameLocation: 'middle',
      nameGap: 30
    },
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return (
          'Channel: <b>' +
          params.data[2] +
          '</b> <br>' +
          'Frequency Score: <b>' +
          params.data[1] +
          '</b> <br>' +
          'Actionable Score: <b>' +
          params.data[0] +
          '</b> <br>'
        );
      }
    },
    series: [
      {
        type: 'scatter',
        data: channel_scores.map(data => [data.x, data.y, data.channel]),
        symbolSize: 8
      }
    ]
  };
};

const getOptionForTrend = (dates, series) => {
  if (dates && series) {
    const legendData = series.map(series => series.name);
    const topItems = legendData.slice(0, 3);
    const otherItems = legendData.slice(3);

    return {
      title: {
        text: 'Channel Wise Score timeline',
        left: 'center',
        textStyle: {
          fontSize: '14px'
        }
      },
      xAxis: {
        type: 'category',
        data: dates
      },
      yAxis: {
        type: 'value'
      },
      series: series.map(channel => ({
        name: channel.name,
        type: 'line',
        data: channel.data
      })),
      legend: {
        top: 25,
        data: topItems.concat('Others'),
        formatter: function (name) {
          if (name === 'Others') {
            return otherItems.join(', ');
          } else {
            return name;
          }
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          const date = params[0].axisValue;
          let tooltip = `${date}<br>`;
          params.forEach(param => {
            tooltip += `<b>${param.seriesName}</b>: ${param.data}<br>`;
          });
          return tooltip;
        }
      }
    };
  } else {
    return {};
  }
};

export default AQSSection;
