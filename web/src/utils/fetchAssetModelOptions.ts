import { store } from "../store/index.ts";
import { getAssets } from "../store/features/playbook/api/index.ts";
import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";
import getCurrentTask from "./getCurrentTask.ts";
import { connectorsWithoutAssets } from "./connectorsWithoutAssets.ts";

export const fetchData = async (val: any = undefined) => {
  const { currentVisibleTask } = playbookSelector(store.getState());
  const id = val?.id ?? currentVisibleTask;
  const [task, currentId] = getCurrentTask(id);

  if (task?.source === "API" || val?.connector_type === "API") return;
  if (
    connectorsWithoutAssets.includes(task?.source ?? "") ||
    connectorsWithoutAssets.includes(val?.connector_type)
  )
    return;
  if (currentId) await getAssetsFunction(currentId);
};

export const getAssetsFunction = async (id: string) => {
  try {
    await store.dispatch(getAssets.initiate(id, { forceRefetch: true }));
  } catch (e) {
    console.log("There was an error:", e);
  }
};
