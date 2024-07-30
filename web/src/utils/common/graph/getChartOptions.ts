import dayjs from "dayjs";

const generateColorPalette = (length: number) => {
  const colors = [
    "#5470C6",
    "#91CC75",
    "#EE6666",
    "#FAC858",
    "#73C0DE",
    "#3BA272",
    "#FC8452",
    "#9A60B4",
    "#EA7CCC",
    "#61A0A8",
    "#D48265",
    "#749F83",
    "#CA8622",
    "#BDA29A",
    "#6E7074",
    "#546570",
    "#C4CCD3",
    "#F05B72",
    "#DD6B66",
    "#E39C47",
  ];
  return colors.slice(0, length);
};

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

  console.log("data", data);

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
