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
      [
        {
          key: "iframe_render",
          label: "Iframe RENDER",
          type: OptionType.IFRAME_RENDER,
          value: task.iframe_url,
        },
      ],
    ],
  };
};
