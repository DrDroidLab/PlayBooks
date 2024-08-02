import { TaskType } from "../index.ts";

type SendMessageType = {
  text?: string;
  channel?: string;
};

export interface Slack {
  type: TaskType.Slack;
  send_message: SendMessageType;
}
