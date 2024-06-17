import * as Types from "../types/index.ts";

export const handleScheduleExtractor = (
  type: Types.ScheduleOptions,
  schedule: Types.ScheduleContractType,
) => {
  switch (type) {
    case Types.ScheduleOptions.ONE_OFF:
      return {};
    case Types.ScheduleOptions.INTERVAL:
      return {
        duration: schedule.duration_in_seconds,
        interval: schedule.interval_in_seconds,
        timezone: schedule.timezone,
      };
    case Types.ScheduleOptions.CRON:
      return {
        duration: schedule.duration_in_seconds,
        cron: schedule.rule,
        timezone: schedule.timezone,
      };

    default:
      return {};
  }
};
