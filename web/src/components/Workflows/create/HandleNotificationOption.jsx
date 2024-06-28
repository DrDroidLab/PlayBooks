import React from "react";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import SlackMessage from "./notifications/SlackMessage.tsx";
import { NotificationOptionTypes } from "../../../utils/notificationOptionTypes.ts";
import MsWebhook from "./notifications/MsWebhook.tsx";

function HandleNotificationOption() {
  const currentWorkflow = useSelector(currentWorkflowSelector);

  switch (currentWorkflow.notification) {
    case NotificationOptionTypes.SLACK_MESSAGE:
      return <SlackMessage />;
    case NotificationOptionTypes.MS_TEAMS_MESSAGE_WEBHOOK:
      return <MsWebhook />;
    default:
      return;
  }
}

export default HandleNotificationOption;
