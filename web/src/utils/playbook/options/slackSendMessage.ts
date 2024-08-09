import { Task } from "../../../types/index.ts";
import { getCurrentAsset } from "../getCurrentAsset.ts";
import { Key, KeyType } from "../key.ts";

export const slackSendMessage = (key: KeyType, task: Task): any[] => {
  switch (key) {
    case Key.CHANNEL:
      return getCurrentAsset(task, undefined, undefined, {
        idValue: "channel_id",
        labelValue: "channel_name",
      });
    default:
      return [];
  }
};
