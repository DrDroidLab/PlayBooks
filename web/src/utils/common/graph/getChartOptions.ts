import dayjs from "dayjs";
import { generateColorPalette } from "../generateColorPalette";

export const getChartOptions = (
  sortedTSData: any,
  tsLabels: string[],
  data: any[],
  unit: string,
  initialLegendsState: any,
) => {
  const xaxisArray = sortedTSData[0].datapoints.map((ts: any) => {
    return dayjs.unix(parseInt(ts.timestamp) / 1000).format("HH:mm");
  });

  const colors = generateColorPalette(data.length);

  return {
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
    color: colors,
    series: data.map((item, index) => ({
      name: tsLabels[index],
      type: "line",
      data: item.ts,
      emphasis: {
        focus: "series",
      },
    })),
  };
};
