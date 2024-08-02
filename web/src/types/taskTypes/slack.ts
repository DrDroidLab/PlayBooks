import { TaskType } from "../index.ts";

type SendMessageType = {
  text?: string;
  message?: string;
};

export interface Slack {
  type: TaskType.Slack;
  send_message: SendMessageType;
}
