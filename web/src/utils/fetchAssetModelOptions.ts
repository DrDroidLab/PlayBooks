import { store } from "../store/index.ts";
import { getAssetModelOptions } from "../store/features/playbook/api/index.ts";
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
  if (step?.source === "BASH" || val?.connector_type === "BASH") {
    await getAssetModelOptionsFunction(
      "REMOTE_SERVER",
      "SSH_SERVER",
      val?.index ?? currentStepIndex,
    );
    return;
  }
  await getAssetModelOptionsFunction(
    val?.connector_type ?? step?.source,
    val?.model_type ?? step?.modelType,
    val?.index ?? currentStepIndex,
  );
};

export const getAssetModelOptionsFunction = async (
  connector_type,
  model_type,
  stepIndex,
) => {
  try {
    const res = await store.dispatch(
      getAssetModelOptions.initiate({
        connector_type,
        model_type,
        stepIndex,
      }),
    );
    const data = res.data;
    if ((data?.asset_model_options?.length ?? 0) > 0)
      store.dispatch(
        setModelTypeOptions({
          options: data?.asset_model_options,
          index: stepIndex,
        }),
      );
  } catch (e) {
    console.log("There was an error:", e);
  }
};
