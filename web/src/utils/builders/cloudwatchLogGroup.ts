import { OptionType } from "../playbooksData.ts";

const getCurrentAsset = (task: any) => {
  const currentAsset = task?.assets?.find((e) => e.region === task.region);

  return currentAsset;
};

export const cloudwatchLogGroupBuilder = (options: any, task: any) => {
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
          type: OptionType.TYPING_DROPDOWN,
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
          type: OptionType.TYPING_DROPDOWN,
          options: getCurrentAsset(task)?.log_groups?.map((e) => {
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
