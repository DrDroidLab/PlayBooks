import { store } from "../../store/index.ts";
import {
  selectCluster,
  selectEksNamespace,
  selectEksRegion,
  setCommand,
} from "../../store/features/playbook/playbookSlice.ts";
import { OptionType } from "../playbooksData.ts";
import { Step } from "../../types/index.ts";

export const eksBuilder = (task: Step, index, options: any) => {
  return {
    triggerGetAssetsKey: "cluster",
    assetFilterQuery: {
      connector_type: task.source,
      type: task.modelType,
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
          selected: task.eksRegion,
          value: task.eksRegion,
          options: options?.map((x) => ({ id: x.region, label: x.region })),
          handleChange: (_, val) => {
            store.dispatch(selectEksRegion({ index, region: val.label }));
          },
        },
        {
          key: "cluster",
          label: "Cluster",
          type: OptionType.OPTIONS,
          selected: task.cluster,
          value: task.cluster,
          options: options
            .find((e) => e.region === task.eksRegion)
            ?.clusters?.map((x) => ({ id: x.name, label: x.name })),
          handleChange: (_, val) => {
            store.dispatch(selectCluster({ index, cluster: val.label }));
          },
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
          handleChange: (_, val) => {
            store.dispatch(selectEksNamespace({ index, namespace: val.label }));
          },
          value: task.eksNamespace,
          selected: task.eksNamespace,
          // requires: ['cluster']
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
          // requires: ['eksNamespace']
        },
      ],
    ],
  };
};
