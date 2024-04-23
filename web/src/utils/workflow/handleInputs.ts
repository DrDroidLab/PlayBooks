import { store } from "../../store/index.ts";
import { setKey } from "../../store/features/workflow/workflowSlice.ts";

export const handleSelect = (e, option) => {
  const type = e.target?.getAttribute("data-type") ?? e;
  store.dispatch(
    setKey({
      key: type,
      value: option.id,
    }),
  );
};

export const handleInput = (key, value) => {
  store.dispatch(
    setKey({
      key,
      value,
    }),
  );
};

export const handleCheckbox = (e) => {
  const checked = e.target?.checked;
  const key = e.target?.getAttribute("data-key");
  store.dispatch(
    setKey({
      key,
      value: checked,
    }),
  );
};
