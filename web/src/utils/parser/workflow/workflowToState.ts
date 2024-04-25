export const workflowToState = (workflow) => {
  const currentWorkflow = {
    name: workflow.name,
    schedule: workflow.schedule?.type?.toLowerCase(),
    workflowType: "slack",
    trigger: {
      channel: {
        channel_id:
          workflow.entry_points[0]?.alert_config?.slack_channel_alert_config
            ?.slack_channel_id,
        name: workflow.entry_points[0]?.alert_config?.slack_channel_alert_config
          ?.slack_channel_name,
      },
      source:
        workflow.entry_points[0]?.alert_config?.slack_channel_alert_config
          ?.slack_alert_type,
      filterString:
        workflow.entry_points[0]?.alert_config?.slack_channel_alert_config
          ?.slack_alert_filter_string,
    },
    playbookId:
      workflow?.playbooks?.length > 0 ? workflow?.playbooks[0].id : null,
    "slack-message":
      workflow.actions.findIndex(
        (e) => e.notification_config.slack_config.message_type === "MESSAGE",
      ) !== -1,
    "reply-to-alert":
      workflow.actions.findIndex(
        (e) =>
          e.notification_config.slack_config.message_type === "THREAD_REPLY",
      ) !== -1,
    cron: workflow.schedule?.periodic?.cron_rule?.rule,
    interval: workflow.schedule?.periodic?.task_interval?.interval_in_seconds,
    duration: workflow.schedule?.periodic?.duration_in_seconds,
  };

  return currentWorkflow;
};
