export enum WorkflowActionOptions {
  SLACK_MESSAGE = "slack_message",
  SLACK_THREAD_REPLY = "slack_thread_reply",
}

export type WorkflowActionContractType = {
  slack_channel_id?: string;
};
