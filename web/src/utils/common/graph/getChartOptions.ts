import dayjs from "dayjs";

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
