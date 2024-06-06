import { OptionType } from "../playbooksData.ts";
import getCurrentTask from "../getCurrentTask.ts";

const getCurrentAsset = (index) => {
  const [task] = getCurrentTask(index);
  const currentAsset = task?.assets?.find((e) => e.region === task?.eksRegion);

  return currentAsset;
};

export const eksBuilder = (options: any, task, index) => {
  return {
    triggerGetAssetsKey: "cluster",
    assetFilterQuery: {
      eks_cluster_model_filters: {
        regions: [
          {
            region: task.eksRegion,
            clusters: [
              {
                name: task.cluster,
              },
            ],
          },
        ],
      },
    },
    builder: [
      [
        {
          key: "eksRegion",
          label: "Region",
          type: OptionType.TYPING_DROPDOWN,
          value: task.eksRegion,
          options:
            options?.map((x) => ({ id: x.region, label: x.region })) ?? [],
        },
        {
          key: "cluster",
          label: "Cluster",
          type: OptionType.TYPING_DROPDOWN,
          value: task.cluster,
          options: options
            ?.find((e) => e.region === task.eksRegion)
            ?.clusters?.map((x) => ({ id: x.name, label: x.name })),
        },
        {
          key: "eksNamespace",
          label: "Namespace",
          type: OptionType.TYPING_DROPDOWN,
          options:
            getCurrentAsset(index)?.clusters?.length > 0
              ? getCurrentAsset(index)?.clusters[0].namespaces?.map((el) => {
                  return { id: el.name, label: el.name };
                })
              : [],
        },
      ],
    ],
  };
};
