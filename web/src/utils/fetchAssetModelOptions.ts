import { store } from "../store/index.ts";
import { getAssets } from "../store/features/playbook/api/index.ts";
import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";
import getCurrentTask from "./getCurrentTask.ts";
import { connectorsWithoutAssets } from "./connectorsWithoutAssets.ts";

export const fetchData = async (val: any = undefined) => {
  const { currentStepId } = playbookSelector(store.getState());
  const id = val?.index ?? currentStepId;
  const [step, currentId] = getCurrentTask(id);

  if (step?.source === "API" || val?.connector_type === "API") return;
  if (
    connectorsWithoutAssets.includes(step?.source) ||
    connectorsWithoutAssets.includes(val?.connector_type)
  )
    return;
  if (step.connectorType && step.modelType) await getAssetsFunction(currentId);
};

export const getAssetsFunction = async (id: string) => {
  try {
    await store.dispatch(getAssets.initiate(id, { forceRefetch: true }));
  } catch (e) {
    console.log("There was an error:", e);
  }
};
