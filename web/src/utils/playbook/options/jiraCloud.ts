import { Task } from "../../../types/index.ts";
import { getCurrentAsset } from "../getCurrentAsset.ts";
import { Key, KeyType } from "../key.ts";

export const jiraCloud = (key: KeyType, task: Task): any[] => {
  const options = getCurrentAsset(task, undefined, undefined, {
    idValue: "key",
    labelValue: "name",
  });
  console.log("options", options);
  switch (key) {
    case Key.PROJECT_KEY:
      return options;
    case Key.ASSIGNEE_KEY:
      return getCurrentAsset(
        task,
        undefined,
        undefined,
        {
            idValue: "display_name",
            labelValue: "display_name",
        }
    );
    default:
      return [];
  }
};
