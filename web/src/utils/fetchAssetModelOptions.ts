import { store } from "../store/index.ts";
import {
  getAssetModelOptions,
  getAssets,
} from "../store/features/playbook/api/index.ts";
import {
  playbookSelector,
  setModelTypeOptions,
} from "../store/features/playbook/playbookSlice.ts";
import getCurrentTask from "./getCurrentTask.ts";
import { connectorsWithoutAssets } from "./connectorsWithoutAssets.ts";

export const fetchData = async (val: any = undefined) => {
  const { currentStepIndex } = playbookSelector(store.getState());
  const index = val?.index ?? currentStepIndex;
  const [step] = getCurrentTask(index);

  if (step?.source === "API" || val?.connector_type === "API") return;
  if (
    connectorsWithoutAssets.includes(step?.source) ||
    connectorsWithoutAssets.includes(val?.connector_type)
  )
    return;
  if (step.connectorType && step.modelType) await getAssetsFunction(index);
};

export const getAssetModelOptionsFunction = async () => {
  try {
    const res = await store.dispatch(
      getAssetModelOptions.initiate(undefined, { forceRefetch: true }),
    );
    const data = res.data;
    if ((data?.asset_model_options?.length ?? 0) > 0)
      store.dispatch(setModelTypeOptions(data?.asset_model_options));
  } catch (e) {
    console.log("There was an error:", e);
  }
};

export const getAssetsFunction = async (index) => {
  try {
    await store.dispatch(getAssets.initiate(index, { forceRefetch: true }));
  } catch (e) {
    console.log("There was an error:", e);
  }
};
