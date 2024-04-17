import React, { useEffect, useState } from 'react';
import { transformToGraphOptions } from './utils';

import apis from '../../API';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import ReactECharts from 'echarts-for-react';

const calculateOptions = ({ title, xSeries, ySeries }) => {
  return {
    title: {
      text: title
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
};

const calculateTSOptions = ({ title, xSeries, ySeries, legend }) => {
  return {
    title: {
      text: title
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

const AlertMetricPerTag = ({ tag_name, timeseries_metrics, histogram_metrics }) => {
  const tsTitle = 'Time based distribution for ' + tag_name;
  const hgTitle = 'Count Distribution for ' + tag_name;

  const ts = transformToGraphOptions({ metric_response: timeseries_metrics[0] });
  const hg = transformToGraphOptions({ metric_response: histogram_metrics[0] });

  return (
    <div>
      <br></br>
      <h3 style={{ textAlign: 'center' }}>
        Alert Distribution by <b>{tag_name}</b>
      </h3>
      <br></br>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ width: '49%' }}>
          {!ts.error && (
            <ReactECharts
              notMerge={true}
              option={calculateTSOptions({
                title: tsTitle,
                xSeries: ts.xSeries,
                ySeries: ts.ySeries,
                legend: ts.legend
              })}
              style={{ height: 400 }}
            />
          )}
        </div>
        <div style={{ width: '2%' }}></div>
        <div style={{ width: '49%' }}>
          {!hg.error && (
            <ReactECharts
              notMerge={true}
              option={calculateOptions({
                title: hgTitle,
                xSeries: hg.xSeries,
                ySeries: hg.ySeries,
                legend: hg.legend
              })}
              style={{ height: 400 }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const AlertDistributionByTags = ({ metric_map, tag_options }) => {
  const [tags, setTags] = useState([]);
  const [selectedTagOptionValue, setSelectedTagOptionValue] = useState('-1');
  const [selectedTagAlertMetricMap, setSelectedTagAlertMetricMap] = useState({});

  const getAlertMetric = apis.useGetAlertMetric();

  useEffect(() => {
    if (metric_map) {
      const tags = Object.keys(metric_map);
      setTags(tags);
    }
    setSelectedTagOptionValue('-1');
    setSelectedTagAlertMetricMap({});
  }, [metric_map, tag_options]);

  const handleTagOptionChange = event => {
    setSelectedTagOptionValue(event.target.value);
    const selectedTagOptionObject = tag_options.find(({ label }) => label === event.target.value);
    const payload = {
      metric_title: 'ALERT_DISTRIBUTION_BY_ALERT_TAG',
      metric_name: 'ALERT_DISTRIBUTION_BY_ALERT_TAG',
      filter_channels: [selectedTagOptionObject.active_channel_label],
      filter_alert_types: [selectedTagOptionObject.alert_type_label],
      filter_alert_tags: [selectedTagOptionObject.label]
    };
    getAlertMetric(
      payload,
      res => {
        const { data } = res;
        setSelectedTagAlertMetricMap(data.metric_map);
      },
      err => {
        console.error(err);
      }
    );
  };

  return (
    <div>
      {tags.map((tag, index) => {
        if (!metric_map) return null;
        if (!(tag in metric_map)) return null;
        if (!metric_map[tag]) return null;
        const timeseries_metrics = metric_map[tag]?.metric_responses?.filter(
          metric => metric.is_timeseries
        );
        const histogram_metrics = metric_map[tag]?.metric_responses?.filter(
          metric => !metric.is_timeseries
        );
        return timeseries_metrics && histogram_metrics ? (
          <AlertMetricPerTag
            key={index}
            tag_name={tag}
            timeseries_metrics={timeseries_metrics}
            histogram_metrics={histogram_metrics}
          />
        ) : null;
      })}
      <br></br>

      {tag_options && tag_options.length > 0 && (
        <>
          <h2>
            <b className="tags_option">Alert Distribution by tags</b>
          </h2>
          <Select
            value={selectedTagOptionValue}
            onChange={handleTagOptionChange}
            inputProps={{ 'aria-label': 'Select' }}
            style={{ width: '100%', borderRadius: '10px', marginTop: '10px' }}
          >
            <MenuItem value="-1">Select a tag</MenuItem>
            {tag_options.map((tag_option, index) => {
              return (
                <MenuItem key={index} value={tag_option.label}>
                  {tag_option.label}
                </MenuItem>
              );
            })}
          </Select>
          {[selectedTagOptionValue].map((tag, index) => {
            if (!selectedTagAlertMetricMap) return null;
            if (!(tag in selectedTagAlertMetricMap)) return null;
            const timeseries_metrics = selectedTagAlertMetricMap[tag]?.metric_responses?.filter(
              metric => metric.is_timeseries
            );
            const histogram_metrics = selectedTagAlertMetricMap[tag]?.metric_responses?.filter(
              metric => !metric.is_timeseries
            );
            return timeseries_metrics && histogram_metrics ? (
              <AlertMetricPerTag
                key={index}
                tag_name={tag}
                timeseries_metrics={timeseries_metrics}
                histogram_metrics={histogram_metrics}
              />
            ) : null;
          })}
        </>
      )}
    </div>
  );
};

export default AlertDistributionByTags;
