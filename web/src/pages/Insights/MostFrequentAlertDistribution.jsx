import React from 'react';
import ReactECharts from 'echarts-for-react';

const MostFrequentAlertDistribution = ({ xAxis, yAxis, series, error, loading }) => {
  const calculateOptions = {
    title: {
      text: 'Distribution of Alerts by Alert Types'
    },
    tooltip: {
      position: 'top',
      axisPointer: {
        type: null // Set axisPointer to 'none' to hide index information
      },
      formatter: function (params) {
        return (
          'Alert Type: <b>' +
          params.seriesName +
          '</b> <br>' +
          'Date: <b>' +
          params.name +
          '</b> <br>' +
          'Count: <b>' +
          params.data[2] +
          '</b> <br>'
        );
      }
    },
    // title: title,
    // singleAxis: singleAxis,
    xAxis: xAxis,
    yAxis: yAxis,
    series: series,
    grid: {
      left: 2,
      bottom: 10,
      right: 50,
      containLabel: true
    }
  };
  return (
    <>
      {!error && !loading && (
        <ReactECharts
          className="scatter_option"
          option={calculateOptions}
          style={{ height: 400 }}
        />
      )}
    </>
  );
};

export default MostFrequentAlertDistribution;
