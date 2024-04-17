import React from 'react';
import ReactECharts from 'echarts-for-react';

const calculateOptions = ({ xSeries, ySeries, legend }) => {
  return {
    title: {
      text: 'Distribution of Alerts by Channel'
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
    yAxis: {
      type: 'value'
    }
  };
};
const AlertsByChannel = ({ xSeries = [], ySeries = [], legend, error }) => {
  return (
    <>
      {!error && (
        <ReactECharts
          notMerge={true}
          option={calculateOptions({ xSeries, ySeries, legend })}
          style={{ height: 400 }}
        />
      )}
    </>
  );
};

export default AlertsByChannel;
