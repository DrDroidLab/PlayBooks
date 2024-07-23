import { currentPlaybookSelector } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";
import { Step } from "../../types/index.ts";

export const getNodes = () => {
  const playbook = currentPlaybookSelector(store.getState());
  const steps: Step[] = playbook?.steps ?? [];
  const nodes = steps.map((step, index) => {
    return {
      id: `node-${step.id}`,
      position: {
        x: 0,
        y: 0,
      },
      dimensions: {
        width: step?.ui_requirement?.width ?? 350,
        height: step?.ui_requirement?.height ?? 250,
      },
      data: {
        step,
        index,
      },
      type: "step",
      dragHandle: ".custom-drag-handle",
    };
  });

  return nodes;
};
