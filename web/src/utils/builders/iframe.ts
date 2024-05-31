import { OptionType } from "../playbooksData.ts";

export const iframeBuilder = (task: any, index: number) => {
  return {
    builder: [
      [
        {
          key: "iframe_url",
          label: "Iframe URL",
          type: OptionType.TEXT_ROW,
          value: task.iframe_url,
        },
      ],
    ],
  };
};
