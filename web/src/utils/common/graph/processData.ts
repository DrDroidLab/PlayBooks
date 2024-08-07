import { getTSLabel } from "../../../components/Playbooks/utils";
import { timeAgo } from "../timeAgo";

export const processData = (tsData: any, result: any) => {
  let sortedTSData = JSON.parse(JSON.stringify(tsData));

  for (let i = 0; i < sortedTSData.length; i++) {
    sortedTSData[i].datapoints = sortedTSData[i].datapoints.sort(
      (a: any, b: any) => {
        return parseInt(a.timestamp) - parseInt(b.timestamp);
      },
    );
  }

  let tsLabels = sortedTSData.map((x: any) => {
    const offsetSeconds = x?.metric_label_values?.find(
      (e) => e.name === "offset_seconds",
    );
    const seconds = parseInt(offsetSeconds?.value ?? "0", 10);
    const labelAppendValue = seconds === 0 ? "Current" : timeAgo(seconds);
    return `${
      result?.timeseries?.metric_expression ??
      getTSLabel(x?.metric_label_values ?? [])
    } - ${labelAppendValue}`;
  });

  let data: any[] = [];
  for (let j = 0; j < sortedTSData.length; j++) {
    data.push({
      ts: sortedTSData[j].datapoints.map((ts: any) => {
        return parseFloat(ts?.value?.toFixed(2));
      }),
      label: sortedTSData[j].label,
    });
  }

  let unit = result?.timeseries?.labeled_metric_timeseries
    ? result?.timeseries?.labeled_metric_timeseries[0]?.unit
    : null;

  return { sortedTSData, tsLabels, data, unit };
};
