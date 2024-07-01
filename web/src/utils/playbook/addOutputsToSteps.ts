import { store } from "../../store/index.ts";
import {
  currentPlaybookSelector,
  setSteps,
} from "../../store/features/playbook/playbookSlice.ts";

export const addOutputsToSteps = (timelineSteps: any[]) => {
  const currentPlaybook = currentPlaybookSelector(store.getState());
  const tasks = currentPlaybook?.ui_requirement.tasks ?? [];
  const dispatch = store.dispatch;

  const steps = tasks?.map((step) => {
    const found = timelineSteps.find(
      (stepData) => stepData.id.toString() === step.id!.toString(),
    );
    if (found) {
      return found;
    } else {
      return step;
    }
  });
  if (tasks.length > 0) dispatch(setSteps(steps));
};
