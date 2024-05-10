import { store } from "../store/index.ts";
import { getAssetModelOptions } from "../store/features/playbook/api/index.ts";
import {
  playbookSelector,
  stepsSelector,
} from "../store/features/playbook/playbookSlice.ts";

export const fetchData = async () => {
  const steps = stepsSelector(store.getState());
  const { currentStepIndex } = playbookSelector(store.getState());
  const step = steps[currentStepIndex];

  if (step.source === "API") return;
  if (step.source === "BASH") {
    await getAssetModelOptionsFunction(
      "REMOTE_SERVER",
      "SSH_SERVER",
      currentStepIndex,
    );
    return;
  }
  await getAssetModelOptionsFunction(
    step.source,
    step.modelType,
    currentStepIndex,
  );
};

export const getAssetModelOptionsFunction = async (
  connector_type,
  model_type,
  stepIndex,
) => {
  try {
    await store
      .dispatch(
        getAssetModelOptions.initiate({
          connector_type,
          model_type,
          stepIndex,
        }),
      )
      .unwrap();
  } catch (e) {
    console.log("There was an error:", e);
  }
};
