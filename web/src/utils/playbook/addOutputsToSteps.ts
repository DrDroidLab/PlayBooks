import { store } from "../../store/index.ts";
import {
  setSteps,
  stepsSelector,
} from "../../store/features/playbook/playbookSlice.ts";

export const addOutputsToSteps = (timelineSteps: any[]) => {
  const playbookSteps = stepsSelector(store.getState());
  const dispatch = store.dispatch;

  const steps = playbookSteps?.map((step) => {
    const found = timelineSteps.find(
      (stepData) => stepData.id.toString() === step.id.toString(),
    );
    if (found) {
      return found;
    } else {
      return step;
    }
  });
  if (steps.length > 0) dispatch(setSteps(steps));
};
