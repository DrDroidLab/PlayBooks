import { store } from "../../store/index.ts";
import { currentWorkflowSelector } from "../../store/features/workflow/workflowSlice.ts";

enum ScheduleOptions {
  ONE_OFF = "one_off",
  INTERVAL = "interval",
  CRON = "cron",
}

enum TimezoneTypes {
  UTC = "UTC",
}

type ScheduleReturnType = {
  duration_in_seconds?: number;
  interval_in_seconds?: number;
  timezone?: TimezoneTypes;
  rule?: string;
};

export default function handleSchedule(
  schedule: ScheduleOptions,
): ScheduleReturnType {
  const workflow: any = currentWorkflowSelector(store.getState());

  switch (schedule) {
    case ScheduleOptions.ONE_OFF:
      return {};
    case ScheduleOptions.INTERVAL:
      return {
        duration_in_seconds: workflow.duration,
        interval_in_seconds: workflow.interval,
        timezone: TimezoneTypes.UTC,
      };
    case ScheduleOptions.CRON:
      return {
        duration_in_seconds: workflow.duration,
        rule: workflow?.cron,
        timezone: TimezoneTypes.UTC,
      };

    default:
      return {};
  }
}
