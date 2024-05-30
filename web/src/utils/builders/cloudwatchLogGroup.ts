import getCurrentTask from "../getCurrentTask.ts";
import { OptionType } from "../playbooksData.ts";

export const cloudwatchLogGroupBuilder = (options: any) => {
  const [task] = getCurrentTask();
  return {
    triggerGetAssetsKey: "region",
    assetFilterQuery: {
      cloudwatch_log_group_model_filters: {
        regions: [task.region],
      },
    },
    builder: [
      [
        {
          key: "region",
          label: "Region",
          type: OptionType.OPTIONS,
          options: options?.map((region) => {
            return {
              id: region,
              label: region,
            };
          }),
          selected: task.region,
        },
        {
          key: "logGroup",
          label: "Log Group",
          type: OptionType.OPTIONS,
          options: task?.assets?.log_groups?.map((e) => {
            return {
              id: e,
              label: e,
            };
          }),
          selected: task.logGroup,
        },
      ],
      [
        {
          key: "cw_log_query",
          label: "Log Filter Query",
          type: OptionType.MULTILINE,
          // requires: ['logGroup']
        },
      ],
    ],
  };
};
