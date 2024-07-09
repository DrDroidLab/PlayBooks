import { store } from "../store/index.ts";
import { currentPlaybookSelector } from "../store/features/playbook/playbookSlice.ts";
import { Step } from "../types/index.ts";

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
  const currentPlaybook = currentPlaybookSelector(store.getState());
  const edge = currentPlaybook?.step_relations?.find(
    (edge) => edge.id === input,
  );
  const parent = edge?.parent;
  const sourceId =
    typeof parent === "string" ? parent?.split("-")[1] : (parent as Step)?.id;
  if (sourceId === "playbook") return "";

  return sourceId;
};
