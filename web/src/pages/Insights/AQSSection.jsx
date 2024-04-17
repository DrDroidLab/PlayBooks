/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import API from '../../API';
import styles from './index.module.css';
import { CircularProgress, Table, TableBody, TableCell, TableRow } from '@mui/material';

const AQSSection = ({ activeChannels }) => {
  const [loading, setLoading] = useState(false);
  const [trendLoading, setTrendLoading] = useState(false);

  const generateAQS = API.useGenerateAQS();
  const generateAQSTrend = API.useGenerateAQSTrend();

  // Sample data for demonstration
  const [aqsScore, setAqsScore] = useState();
  const [aqsChannelData, setAqsChannelData] = useState([]);
  const [channelAQSScores, setChannelAQSScores] = useState([]);
  const [aqsTrends, setAqsTrends] = useState({});

  const getAQSData = () => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    generateAQS(
      {
        filter_channels: activeChannels.map(channel => channel.label),
        timeRange: { time_geq: currentTimestamp - 1209600, time_lt: currentTimestamp }
      },
      res => {
        setAqsScore(Math.floor(res.data.aqs_score_models[0].aqs));
        setAqsChannelData(
          res.data.channel_aqs_data
            .map(channel => {
              return {
                channel_name: channel.channel_name,
                score: Math.floor(channel.aqs_score_models[0].aqs)
              };
            })
            .sort((a, b) => b.score - a.score)
        );
        setChannelAQSScores(
          res.data.channel_aqs_data.map(channel => {
            return {
              channel: channel.channel_name,
              x: Math.floor(channel.aqs_score_models[0].score_a),
              y: Math.floor(channel.aqs_score_models[0].score_f)
            };
          })
        );
        setLoading(false);
      },
      err => {
        console.log('AQS generation failed');
        setLoading(false);
      }
    );

    setTrendLoading(true);
    generateAQSTrend(
      {
        filter_channels: activeChannels.map(channel => channel.label)
      },
      res => {
        const trendDates = res.data.channel_aqs_data[0].aqs_score_models
          .map(x => {
            return new Date(parseInt(x['timestamp'], 10) * 1000).toISOString().split('T')[0];
          })
          .reverse();
        const trendSeries = res.data.channel_aqs_data.map(x => {
          return {
            name: x['channel_name'],
            data: x['aqs_score_models']
              .map(x => {
                return parseInt(x['aqs']);
              })
              .reverse()
          };
        });
        setAqsTrends({ dates: trendDates, series: trendSeries });
        setTrendLoading(false);
      },
      err => {
        console.log('AQS Trend generation failed');
        setTrendLoading(false);
      }
    );
  };

  useEffect(() => {
    setLoading(true);
    getAQSData();
  }, []);

  useEffect(() => {
    setLoading(true);
    getAQSData();
  }, [activeChannels]);

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
      {loading && trendLoading ? (
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
                    <TableCell style={{ maxWidth: '80px' }}>{data.channel_name}</TableCell>
                    <TableCell style={{ maxWidth: '40px' }}>{data.score} / 100</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className={styles['aqs-block'] + ' ' + styles['info-graph']}>
            <ReactECharts option={getOptionForGraph(channelAQSScores)} />
          </div>
          <div className={styles['aqs-block']}>
            <ReactECharts option={getOptionForTrend(aqsTrends.dates, aqsTrends.series)} />
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
