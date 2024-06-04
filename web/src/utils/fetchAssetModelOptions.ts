import { store } from "../store/index.ts";
import {
  getAssetModelOptions,
  getAssets,
} from "../store/features/playbook/api/index.ts";
import {
  playbookSelector,
  setModelTypeOptions,
  stepsSelector,
} from "../store/features/playbook/playbookSlice.ts";

export const fetchData = async (val: any = undefined) => {
  const steps = stepsSelector(store.getState());
  const { currentStepIndex } = playbookSelector(store.getState());
  const step = steps[val?.index ?? currentStepIndex];

  if (step?.source === "API" || val?.connector_type === "API") return;
  await getAssetsFunction();
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

export const getAssetsFunction = async () => {
  try {
    await store.dispatch(getAssets.initiate(undefined, { forceRefetch: true }));
  } catch (e) {
    console.log("There was an error:", e);
  }
};
