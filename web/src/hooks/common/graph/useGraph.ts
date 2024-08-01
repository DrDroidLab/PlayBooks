import { useState, useEffect, useMemo, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { handleLegendClick as handleLegendClickUtil } from "../../../utils/common/graph/handleLegendClick";
import { processData } from "../../../utils/common/graph/processData";
import { getChartOptions } from "../../../utils/common/graph/getChartOptions";

const useGraph = (result: any) => {
  const [chartOptions, setChartOptions] = useState({});
  const [showGraph, setShowGraph] = useState(false);
  const [selectedLegends, setSelectedLegends] = useState({});
  const chartRef = useRef<ReactECharts>(null);

  let tsData = result?.timeseries?.labeled_metric_timeseries;

  useEffect(() => {
    if (tsData && tsData.length > 0 && tsData[0].datapoints) {
      const { sortedTSData, tsLabels, data, unit } = processData(
        tsData,
        result,
      );

      const initialLegendsState = tsLabels.reduce((acc: any, label: string) => {
        acc[label] = true;
        return acc;
      }, {});
      setSelectedLegends(initialLegendsState);

      const updatedChartOptions = getChartOptions(
        sortedTSData,
        tsLabels,
        data,
        unit,
        initialLegendsState,
      );
      setChartOptions(updatedChartOptions);
      setShowGraph(true);
    } else {
      setChartOptions({});
      setShowGraph(false);
    }
    (chartRef.current as any)?.resize();
  }, [tsData]);

  const handleLegendClick = handleLegendClickUtil(
    selectedLegends,
    setSelectedLegends,
    setChartOptions,
  );

  return { chartOptions, showGraph, handleLegendClick, chartRef };
};

export default useGraph;
