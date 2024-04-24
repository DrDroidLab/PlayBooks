import { store } from "../../../store/index.ts";
import {
  setCurrentWorkflowKey,
  setCurrentWorkflowTriggerKey,
} from "../../../store/features/workflow/workflowSlice.ts";

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

export const handleTriggerSelect = (key, value) => {
  store.dispatch(
    setCurrentWorkflowTriggerKey({
      key,
      value,
    }),
  );
};

export const handleTriggerInput = (key, value) => {
  store.dispatch(
    setCurrentWorkflowTriggerKey({
      key,
      value,
    }),
  );
};
