import { store } from "../../store/index.ts";
import { setCurrentWorkflowKey } from "../../store/features/workflow/workflowSlice.ts";

export const handleSelect = (e, option) => {
  const type = e.target?.getAttribute("data-type") ?? e;
  store.dispatch(
    setCurrentWorkflowKey({
      key: type,
      value: option.id,
    }),
  );
};

export const handleInput = (key, value) => {
  store.dispatch(
    setCurrentWorkflowKey({
      key,
      value,
    }),
  );
};

export const handleCheckbox = (e) => {
  const checked = e.target?.checked;
  const key = e.target?.getAttribute("data-key");
  store.dispatch(
    setCurrentWorkflowKey({
      key,
      value: checked,
    }),
  );
};
