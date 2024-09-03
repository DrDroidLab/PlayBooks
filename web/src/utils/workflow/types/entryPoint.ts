export enum WorkflowEntryPointOptions {
  API = "api",
  SLACK_CHANNEL_ALERT = "slack_channel_alert",
  PAGERDUTY_INCIDENT = "pagerduty_incident",
<<<<<<< HEAD
  ROOTLY_INCIDENT = "rootly_incident",
=======
>>>>>>> 6588b2f402ef53f21c3c17e13f67f5e4dcb2e902
  ZENDUTY_INCIDENT = "zenduty_incident",
}

export type WorkflowEntryPointContractType = {
  slack_channel_id?: string;
  slack_channel_name?: string;
  slack_alert_type?: string;
  slack_alert_filter_string?: string;
  service_name?: string;
  incident_title?: string;
};
