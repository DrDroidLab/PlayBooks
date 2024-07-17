import { updateStep } from "../../../store/features/playbook/playbookSlice.ts";
import { store } from "../../../store/index.ts";

function updateStepById(key: string, value: any, id: string) {
  store.dispatch(
    updateStep({
      id,
      key,
      value,
    }),
  );
}

export default updateStepById;
