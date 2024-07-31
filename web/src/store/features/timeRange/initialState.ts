import { timeRangeOptions } from "../../../components/common/TimeRangeSelector/utils/timeRangeOptions";

const defaultRangeSelectionId = "now-30";

export type InitialStateType = {
  timeRange: string;
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  time_lt?: string | Date;
  time_geq?: string | Date;
};

export const initialState: InitialStateType = {
  timeRange:
    timeRangeOptions.find((o) => o.id === defaultRangeSelectionId)?.label ?? "",
  startTime: defaultRangeSelectionId,
  endTime: "now",
  time_lt: undefined,
  time_geq: undefined,
};
