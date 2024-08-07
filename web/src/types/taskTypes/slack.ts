import { TaskType } from "../index.ts";

type SendMessageType = {
  channel?: string;
  message?: string;
};

export interface Slack {
  type: TaskType.Slack;
  send_message: SendMessageType;
}
