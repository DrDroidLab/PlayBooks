import { store } from "../../store/index.ts";
import { setCommand } from "../../store/features/playbook/playbookSlice.ts";
import { OptionType } from "../playbooksData.ts";
import getCurrentTask from "../getCurrentTask.ts";

export const eksBuilder = (options: any) => {
  const [task, index] = getCurrentTask();
  return {
    triggerGetAssetsKey: "cluster",
    assetFilterQuery: {
      filters: {
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
    },
    builder: [
      [
        {
          key: "eksRegion",
          label: "Region",
          type: OptionType.OPTIONS,
          value: task.eksRegion,
          options:
            options?.map((x) => ({ id: x.region, label: x.region })) ?? [],
        },
        {
          key: "cluster",
          label: "Cluster",
          type: OptionType.OPTIONS,
          value: task.cluster,
          options: options
            ?.find((e) => e.region === task.eksRegion)
            ?.clusters?.map((x) => ({ id: x.name, label: x.name })),
        },
        {
          key: "eksNamespace",
          label: "Namespace",
          type: OptionType.OPTIONS,
          options:
            task.assets?.clusters?.length > 0
              ? task.assets?.clusters[0].namespaces?.map((el) => {
                  return { id: el.name, label: el.name };
                })
              : [],
        },
        {
          key: "command",
          label: "Command Type",
          type: OptionType.OPTIONS,
          options: task.assets?.commands?.map((el) => {
            return { id: el.type, label: el.description, command: el };
          }),
          handleChange: (_, val) => {
            store.dispatch(setCommand({ index, command: val.command }));
          },
          value: task.command?.type,
          selected: task.command?.type,
        },
      ],
    ],
  };
};
