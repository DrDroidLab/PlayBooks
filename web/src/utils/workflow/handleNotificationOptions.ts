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
      ];
    case "api":
      return [NotificationOptionTypes.SLACK_MESSAGE];
    case "pagerduty_incident":
      return [NotificationOptionTypes.PAGERDUTY_NOTES];
  }
}

export default handleNotificationOptions;
