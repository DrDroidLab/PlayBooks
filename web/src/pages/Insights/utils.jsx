/* eslint-disable array-callback-return */
import dayjs from 'dayjs';

const transformToGraphOptions = data => {
  let error;
  if (!data.metric_response.data) {
    error = 'No data available';
    return { error };
  }
  if (Object.keys(data.metric_response.data[0]).length === 0) {
    error = 'No data available';
    return { error };
  }
  const isTimeSeries = data.metric_response.is_timeseries;
  if (isTimeSeries) {
    const xSeriesNumber = data.metric_response.x_series.map(item => Number(item));
    const xSeries = xSeriesNumber.map(item => dayjs(item * 1000).format('DD-MM-YY'));
    const legend = data.metric_response.data.map(({ label_group }) => label_group[0].value);
    const ySeries = data.metric_response.data;
    return { xSeries, ySeries, legend, error: false };
  }
  if (!isTimeSeries) {
    const xSeries = data.metric_response.data.map(({ label_group }) =>
      label_group[0].value.replace(/&gt;/g, '>').replace(/&lt;/g, '<')
    );
    const ySeries = data.metric_response.data.reduce((acc, item) => {
      const { y_series } = item;
      acc.push(y_series[0]);
      return acc;
    }, []);
    return { xSeries, ySeries, error: false };
  }
};

const transformForScatterPlot = values => {
  let error;
  if (!values.metric_response) {
    error = 'No data available';
    return { error };
  }
  if (!values.metric_response.data) {
    error = 'No data available';
    return { error };
  }
  if (Object.keys(values.metric_response.data[0]).length === 0) {
    error = 'No data available';
    return { error };
  }
  const xSeriesNumber = values.metric_response.x_series.map(item => Number(item));
  const dates = xSeriesNumber.map(item => dayjs(item * 1000).format('DD-MM-YY'));
  const labels = values.metric_response.data.map(({ label_group }) =>
    label_group[0].value.replace(/&gt;/g, '>').replace(/&lt;/g, '<')
  );
  const data = values.metric_response.data.reduce((acc, item, index) => {
    const { y_series } = item;
    y_series.map((yVal, yIndex) => {
      acc.push([index, yIndex, yVal]);
    });
    return acc;
  }, []);
  const colors = ['#636EFA', '#EF553B', '#00CC96', '#AB63FA', '#FFA15A'];
  const maxLabels = 10;
  const interval = Math.ceil(dates.length / maxLabels) - 1;
  const maxDataValue = Math.max(...data.map(item => item[2]));
  const maxCircleSize = 20; // You can adjust this value as needed
  const scaleFactor = maxCircleSize / maxDataValue;

  const xAxis = {
    type: 'category',
    data: dates, // Your array of dates
    left: 150,
    boundaryGap: false,
    axisLabel: {
      interval: interval
    },
    splitLine: {
      show: true
    }
  };

  const yAxis = {
    type: 'category',
    data: labels, // Your array of labels
    axisLabel: {
      formatter: function (value) {
        // Convert value to string, truncate, and add ellipses if longer than a threshold
        var label = value.toString();
        if (label.length > 20) {
          label = label.substring(0, 20) + '...';
        }
        return label.replace(' ', '\n');
      },
      fontSize: 12
    },
    splitLine: {
      show: true
    }
  };

  const series = labels.map((day, idx) => {
    return {
      name: day,
      type: 'scatter', // or another appropriate type based on your data
      data: data.filter(item => item[0] === idx).map(item => [item[1], idx, item[2]]),
      symbolSize: function (dataItem) {
        return dataItem[2] * scaleFactor; // scaleFactor to adjust size
      },
      itemStyle: {
        color: colors[idx % colors.length]
      }
    };
  });
  return { xAxis: xAxis, yAxis: yAxis, series: series, error: false };
};

const integrationURLMapping = {
  DATADOG: '/integrations/datadog',
  NEW_RELIC: '/integrations/new_relic',
  SENTRY: '/integrations/sentry',
  CLOUDWATCH: '/integrations/cloudwatch',
  OPS_GENIE: '/integrations/ops_genie'
};

export { transformToGraphOptions, transformForScatterPlot, integrationURLMapping };
