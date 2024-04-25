import { store } from "../../../store/index.ts";

export const stateToWorkflow = () => {
  const workflow: any = store.getState().workflows.currentWorkflow;

  const responseBody: any = {
    workflow: {
      id: workflow.id,
      name: workflow.name,
      schedule: {
        type: workflow.schedule.toUpperCase(),
      },
      playbooks: [
        {
          id: parseInt(workflow.playbookId, 10),
        },
      ],
      entry_points: [
        {
          type: "ALERT",
          alert_config: {
            alert_type: "SLACK_CHANNEL_ALERT",
            slack_channel_alert_config: {
              slack_channel_asset_id: 1,
              slack_channel_id: workflow.trigger?.channel?.channel_id,
              slack_channel_name: workflow.trigger?.channel?.channel_name,
              slack_alert_type: workflow.trigger?.source,
              slack_alert_filter_string: workflow.trigger?.filterString,
            },
          },
        },
      ],
      actions: [],
    },
  };

  if (workflow["slack-message"]) {
    responseBody.workflow.actions.push({
      type: "NOTIFY",
      notification_config: {
        type: "SLACK",
        slack_config: {
          message_type: "MESSAGE",
          slack_channel_id: workflow.trigger?.channel?.channel_id,
        },
      },
    });
  }

  if (workflow["reply-to-alert"]) {
    responseBody.workflow.actions.push({
      type: "NOTIFY",
      notification_config: {
        type: "SLACK",
        slack_config: {
          message_type: "THREAD_REPLY",
          slack_channel_id: workflow.trigger?.channel?.channel_id,
        },
      },
    });
  }

  switch (workflow.schedule) {
    case "one_off":
      responseBody.workflow.schedule.one_off = {};
      break;
    case "periodic":
      if (workflow.cron) {
        responseBody.workflow.schedule.periodic = {
          type: "CRON",
          duration_in_seconds: workflow.duration,
          cron_rule: {
            rule: workflow.cron,
            timezone: "UTC",
          },
        };
      }
      if (workflow.interval) {
        responseBody.workflow.schedule.periodic = {
          type: "INTERVAL",
          duration_in_seconds: workflow.duration,
          task_interval: {
            interval_in_seconds: workflow.interval,
          },
        };
      }
      break;
    default:
      break;
  }

  console.log("res", responseBody);

  return responseBody;
};
