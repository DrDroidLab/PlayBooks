import { store } from "../../../store";
import { setPermanentView } from "../../../store/features/drawers/drawersSlice";
import { PermanentDrawerTypes } from "../../../store/features/drawers/permanentDrawerTypes";
import { setCurrentVisibleTask } from "../../../store/features/playbook/playbookSlice";

const taskDetailsId = PermanentDrawerTypes.TASK_DETAILS;

export const setCurrentVisibleTaskFunction = (id: string) => {
  store.dispatch(setCurrentVisibleTask(id));
  store.dispatch(setPermanentView(taskDetailsId));
};
