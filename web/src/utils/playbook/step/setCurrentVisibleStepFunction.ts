import { store } from "../../../store";
import { setPermanentView } from "../../../store/features/drawers/drawersSlice";
import { PermanentDrawerTypes } from "../../../store/features/drawers/permanentDrawerTypes";
import { setCurrentVisibleStep } from "../../../store/features/playbook/playbookSlice";

const stepDetailsId = PermanentDrawerTypes.STEP_DETAILS;

export const setCurrentVisibleStepFunction = (id: string) => {
  store.dispatch(setCurrentVisibleStep(id));
  store.dispatch(setPermanentView(stepDetailsId));
};
