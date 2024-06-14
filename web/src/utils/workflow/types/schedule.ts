export enum ScheduleOptions {
  ONE_OFF = "one_off",
  INTERVAL = "interval",
  CRON = "cron",
}

export enum TimezoneTypes {
  UTC = "UTC",
}

export type ScheduleContractType = {
  duration_in_seconds?: number;
  interval_in_seconds?: number;
  timezone?: TimezoneTypes;
  rule?: string;
};
