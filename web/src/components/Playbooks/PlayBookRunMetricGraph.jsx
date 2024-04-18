import ReactECharts from 'echarts-for-react';
import { useState, useEffect, useMemo } from 'react';
import styles from './index.module.css';

import { getTSLabel } from './utils';

import SeeMoreText from './SeeMoreText';

import dayjs from 'dayjs';
import useKeyPressed from '../../hooks/useKeyPressed';

const PlayBookRunMetricGraph = ({ title, result, timestamp, error }) => {
  const [chartOptions, setChartOptions] = useState({});
  const [showGraph, setShowGraph] = useState(false);
  const [selectedLegends, setSelectedLegends] = useState({});
  const keyPressed = useKeyPressed();

  let tsData = useMemo(() => {
    return result?.timeseries?.labeled_metric_timeseries
      ? result?.timeseries?.labeled_metric_timeseries
      : null;
  }, [result]);

  let unit = result?.timeseries?.labeled_metric_timeseries
    ? result?.timeseries?.labeled_metric_timeseries[0]?.unit
    : null;

  const handleLegendClick = params => {
    let newSelectedLegends = selectedLegends;
    const selectedLegendsFiltered = Object.values(selectedLegends).filter(e => e);
    const allSelected = selectedLegendsFiltered.length === Object.keys(selectedLegends).length;
    const isSelected = selectedLegends[params.name];

    if (!allSelected && isSelected) {
      for (let legend of Object.keys(selectedLegends)) {
        newSelectedLegends[legend] = true;
      }
    } else {
      if (keyPressed) {
        newSelectedLegends = {
          ...newSelectedLegends,
          [params.name]: !isSelected
        };
      } else {
        for (let legend of Object.keys(selectedLegends)) {
          newSelectedLegends[legend] = false;
        }
        // Toggle the selection state for the clicked legend
        newSelectedLegends = {
          ...newSelectedLegends,
          [params.name]: true
        };
      }
    }

    setChartOptions(prev => {
      return {
        ...prev,
        legend: {
          ...prev.legend,
          selected: newSelectedLegends
        }
      };
    });

    setSelectedLegends(newSelectedLegends);
  };

  useEffect(() => {
    if (tsData && tsData.length > 0 && tsData[0].datapoints) {
      let sortedTSData = JSON.parse(JSON.stringify(tsData));

      for (let i = 0; i < sortedTSData.length; i++) {
        sortedTSData[i].datapoints = sortedTSData[i].datapoints.sort((a, b) => {
          return parseInt(a.timestamp) - parseInt(b.timestamp);
        });
      }

      let tsLabels = sortedTSData.map(x => getTSLabel(x?.metric_label_values ?? []));

      let data = [];
      for (let j = 0; j < sortedTSData.length; j++) {
        data.push({
          ts: sortedTSData[j].datapoints.map(ts => {
            return parseFloat(ts?.value?.toFixed(2));
          }),
          label: sortedTSData[j].label
        });
      }

      let series = [];
      for (let i = 0; i < data.length; i++) {
        series.push({
          name: tsLabels[i],
          type: 'line',
          data: data[i]['ts'],
          emphasis: {
            focus: 'series'
          }
        });
      }

      const initialLegendsState = tsLabels.reduce((acc, label) => {
        acc[label] = true;
        return acc;
      }, {});
      setSelectedLegends(initialLegendsState);

      let xaxisArray = sortedTSData[0].datapoints.map(ts => {
        return dayjs.unix(parseInt(ts.timestamp) / 1000).format('HH:mm');
      });

      let updatedChartOptions = {
        xAxis: {
          type: 'category',
          data: xaxisArray,
          boundaryGap: false
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          type: 'scroll',
          orient: 'horizontal',
          bottom: 0,
          data: tsLabels,
          selected: initialLegendsState
        },
        yAxis: {
          type: 'value',
          name: unit
        },
        series: series
      };

      setChartOptions(updatedChartOptions);
      setShowGraph(true);
    } else {
      setChartOptions({});
      setShowGraph(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tsData]);

  const onEvents = {
    legendselectchanged: handleLegendClick
  };

  return (
    <div className={styles['graph-box']}>
      <p className={styles['graph-title']}>
        <SeeMoreText text={title} />
      </p>
      {!showGraph && (
        <p className={styles['graph-error']}>
          {error ? <SeeMoreText truncSize={150} text={error} /> : 'No data available'}
        </p>
      )}
      {showGraph && (
        <ReactECharts
          onEvents={onEvents}
          style={{
            overflow: 'scroll'
          }}
          option={chartOptions}
          notMerge={true}
        />
      )}

      {!showGraph && timestamp && (
        <p className={styles['graph-ts-error']}>
          <i>Updated at: {timestamp}</i>
        </p>
      )}
      {showGraph && timestamp && (
        <p className={styles['graph-ts']}>
          <i>Updated at: {timestamp}</i>
        </p>
      )}
    </div>
  );
};

export default PlayBookRunMetricGraph;
