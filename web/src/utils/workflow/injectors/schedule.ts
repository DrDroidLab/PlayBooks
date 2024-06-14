import { store } from "../../../store/index.ts";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import * as Types from "../types/index.ts";

export const handleScheduleInjector = (): Types.ScheduleContractType => {
  const workflow: any = currentWorkflowSelector(store.getState());

  switch (workflow.schedule) {
    case Types.ScheduleOptions.ONE_OFF:
      return {};
    case Types.ScheduleOptions.INTERVAL:
      return {
        duration_in_seconds: workflow.duration,
        interval_in_seconds: workflow.interval,
        timezone: Types.TimezoneTypes.UTC,
      };
    case Types.ScheduleOptions.CRON:
      return {
        duration_in_seconds: workflow.duration,
        rule: workflow?.cron,
        timezone: Types.TimezoneTypes.UTC,
      };

    default:
      return {};
  }
};
