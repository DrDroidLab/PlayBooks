import { store } from "../store/index.ts";
import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";

export const extractSource = (input: string): string => {
  if (!input) return "";

  const split = input.split("-");

  switch (split.length) {
    case 0:
      return "";
    default:
      return split[split.length - 1];
  }
};

export const extractParent = (input: string): string => {
  const { playbookEdges } = playbookSelector(store.getState());
  const edge = playbookEdges.find((edge) => edge.id === input);
  const sourceId = edge?.source?.split("-")[1];
  if (sourceId === "playbook") return "";

  return sourceId;
};
