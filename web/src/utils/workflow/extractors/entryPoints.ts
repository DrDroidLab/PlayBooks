import * as Types from "../types/index.ts";

export const handleEntryPointsExtractor = (
  type: Types.WorkflowEntryPointOptions,
  entryPoint: Types.WorkflowEntryPointContractType,
) => {
  switch (type) {
    case Types.WorkflowEntryPointOptions.API:
      return {};
    case Types.WorkflowEntryPointOptions.SLACK_CHANNEL_ALERT:
      return {
        trigger: {
          channel: {
            channel_id: entryPoint.slack_channel_id,
            channel_name: entryPoint.slack_channel_name,
          },
          source: entryPoint.slack_alert_type,
          filterString: entryPoint.slack_alert_filter_string,
        },
      };
    case Types.WorkflowEntryPointOptions.PAGERDUTY_INCIDENT:
      return {
        trigger: {
          serviceName: entryPoint.service_name,
          title: entryPoint.incident_title,
        },
      };
    case Types.WorkflowEntryPointOptions.ZENDUTY_INCIDENT:
      return {
        trigger: {
          serviceName: entryPoint.service_name,
          title: entryPoint.incident_title,
        },
      };

    default:
      return {};
  }
};
