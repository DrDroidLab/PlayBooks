import { store } from "../../store/index.ts";
import { currentWorkflowSelector } from "../../store/features/workflow/workflowSlice.ts";
import { NotificationOptionTypes } from "../notificationOptionTypes.ts";

function handleNotificationOptions() {
  const currentWorkflow = currentWorkflowSelector(store.getState());

  switch (currentWorkflow.workflowType) {
    case "slack_channel_alert":
      return [
        NotificationOptionTypes.SLACK_MESSAGE,
        NotificationOptionTypes.THREAD_REPLY,
        NotificationOptionTypes.MS_TEAMS_MESSAGE_WEBHOOK,
      ];
    case "api":
      return [
        NotificationOptionTypes.SLACK_MESSAGE,
        NotificationOptionTypes.MS_TEAMS_MESSAGE_WEBHOOK,
      ];
    case "pagerduty_incident":
      return [
        NotificationOptionTypes.PAGERDUTY_NOTES,
        NotificationOptionTypes.MS_TEAMS_MESSAGE_WEBHOOK,
      ];
  }
}

export default handleNotificationOptions;
