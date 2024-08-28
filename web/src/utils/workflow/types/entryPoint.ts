export enum WorkflowEntryPointOptions {
  API = "api",
  SLACK_CHANNEL_ALERT = "slack_channel_alert",
  PAGERDUTY_INCIDENT = "pagerduty_incident",
  ROOTLY_INCIDENT = "rootly_incident",
}

export type WorkflowEntryPointContractType = {
  slack_channel_id?: string;
  slack_channel_name?: string;
  slack_alert_type?: string;
  slack_alert_filter_string?: string;
  service_name?: string;
  incident_title?: string;
};
