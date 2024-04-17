import React from 'react';
import ReactECharts from 'echarts-for-react';

const MostFrequentAlerts = ({ xSeries, ySeries, error }) => {
  const calculateOptions = {
    title: {
      text: 'Most Frequent Alerts'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: xSeries,
        axisTick: {
          alignWithLabel: true
        },
        axisLabel: {
          formatter: function (value) {
            const maxLength = 10;
            return value.length > maxLength ? value.slice(0, maxLength) + '...' : value;
          }
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: 'Direct',
        type: 'bar',
        barWidth: '60%',
        data: ySeries
      }
    ]
  };
  return <>{!error && <ReactECharts option={calculateOptions} style={{ height: 400 }} />}</>;
};

export default MostFrequentAlerts;
