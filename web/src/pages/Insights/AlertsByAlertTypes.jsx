import React from 'react';
import ReactECharts from 'echarts-for-react';

const AlertsByAlertTypes = ({ xSeries = [], ySeries = [], legend = [], error }) => {
  const calculateOptions = {
    title: {
      text: 'Distribution of Alerts by Source',
      top: 0
    },
    tooltip: {
      trigger: 'axis'
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xSeries,
      show: true
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: 'blue',
        width: '4'
      }
    },
    legend: {
      data: legend,
      top: 30
    },
    grid: {
      top: 60,
      left: 30,
      right: 60,
      bottom: 30,
      containLabel: true
    },
    series: [...ySeries].map(({ y_series, label_group }) => ({
      data: y_series,
      name: label_group[0].value,
      type: 'line'
    })),
    replaceMerge: ['series'],
    yAxis: {
      type: 'value'
    }
  };

  return (
    <>
      {!error && <ReactECharts option={calculateOptions} notMerge={true} style={{ height: 400 }} />}
    </>
  );
};

export default AlertsByAlertTypes;
