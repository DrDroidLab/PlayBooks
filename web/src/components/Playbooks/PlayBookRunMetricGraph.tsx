import ReactECharts from "echarts-for-react";
import { useState, useEffect, useMemo, useRef } from "react";
import styles from "./index.module.css";
import { getTSLabel } from "./utils";
import SeeMoreText from "./SeeMoreText";
import dayjs from "dayjs";
import { renderTimestamp } from "../../utils/DateUtils";
import useKeyPressed from "../../hooks/common/useKeyPressed";

const PlayBookRunMetricGraph = ({ title, result, timestamp, error }) => {
  const [chartOptions, setChartOptions] = useState({});
  const [showGraph, setShowGraph] = useState(false);
  const [selectedLegends, setSelectedLegends] = useState({});
  const keyPressed = useKeyPressed();
  const chart = useRef<ReactECharts>(null);

  let tsData = useMemo(() => {
    return result?.timeseries?.labeled_metric_timeseries;
  }, [result]);

  let unit = result?.timeseries?.labeled_metric_timeseries
    ? result?.timeseries?.labeled_metric_timeseries[0]?.unit
    : null;

  (chart.current as any)?.resize();

  const handleLegendClick = (params) => {
    let newSelectedLegends = selectedLegends;
    const selectedLegendsFiltered = Object.values(selectedLegends).filter(
      (e) => e,
    );
    const allSelected =
      selectedLegendsFiltered.length === Object.keys(selectedLegends).length;
    const isSelected = selectedLegends[params.name];

    if (!allSelected && isSelected) {
      for (let legend of Object.keys(selectedLegends)) {
        newSelectedLegends[legend] = true;
      }
    } else {
      if (keyPressed) {
        newSelectedLegends = {
          ...newSelectedLegends,
          [params.name]: !isSelected,
        };
      } else {
        for (let legend of Object.keys(selectedLegends)) {
          newSelectedLegends[legend] = false;
        }
        // Toggle the selection state for the clicked legend
        newSelectedLegends = {
          ...newSelectedLegends,
          [params.name]: true,
        };
      }
    }

    setChartOptions((prev: any) => {
      return {
        ...prev,
        legend: {
          ...prev.legend,
          selected: newSelectedLegends,
        },
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

      let tsLabels = sortedTSData.map(
        (x) =>
          result?.timeseries?.metric_name ??
          getTSLabel(x?.metric_label_values ?? []),
      );

      let data: any = [];
      for (let j = 0; j < sortedTSData.length; j++) {
        data.push({
          ts: sortedTSData[j].datapoints.map((ts) => {
            return parseFloat(ts?.value?.toFixed(2));
          }),
          label: sortedTSData[j].label,
        });
      }

      let series: any = [];
      for (let i = 0; i < data.length; i++) {
        series.push({
          name: tsLabels[i],
          type: "line",
          data: data[i]["ts"],
          emphasis: {
            focus: "series",
          },
        });
      }

      const initialLegendsState = tsLabels.reduce((acc, label) => {
        acc[label] = true;
        return acc;
      }, {});
      setSelectedLegends(initialLegendsState);

      let xaxisArray = sortedTSData[0].datapoints.map((ts) => {
        return dayjs.unix(parseInt(ts.timestamp) / 1000).format("HH:mm");
      });

      let updatedChartOptions = {
        xAxis: {
          type: "category",
          data: xaxisArray,
          boundaryGap: false,
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          type: "scroll",
          orient: "horizontal",
          bottom: 0,
          data: tsLabels,
          selected: initialLegendsState,
        },
        yAxis: {
          type: "value",
          name: unit,
        },
        series: series,
      };

      setChartOptions(updatedChartOptions);
      setShowGraph(true);
    } else {
      setChartOptions({});
      setShowGraph(false);
    }
    (chart.current as any)?.resize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tsData]);

  const onEvents = {
    legendselectchanged: handleLegendClick,
  };

  return (
    <div className={styles["graph-box"]}>
      <div className={styles["graph-title"]}>
        <SeeMoreText text={title} />
      </div>
      {!showGraph && (
        <div className={styles["graph-error"]}>
          {error ? (
            <SeeMoreText truncSize={150} text={error} />
          ) : (
            "No data available"
          )}
        </div>
      )}
      {showGraph && (
        <ReactECharts
          onEvents={onEvents}
          className="flex flex-1"
          option={chartOptions}
          notMerge={true}
          ref={chart}
        />
      )}

      {!showGraph && timestamp && (
        <p className={styles["graph-ts-error"]}>
          <i>Updated at: {renderTimestamp(timestamp)}</i>
        </p>
      )}
      {showGraph && timestamp && (
        <p className={styles["graph-ts"]}>
          <i>Updated at: {renderTimestamp(timestamp)}</i>
        </p>
      )}
    </div>
  );
};

export default PlayBookRunMetricGraph;
