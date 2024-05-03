import { getStepTitle } from "../../components/Playbooks/utils";
import { store } from "../../store/index.ts";
import { executePlaybook } from "../../store/features/playbook/api/index.ts";
import { rangeSelector } from "../../store/features/timeRange/timeRangeSlice.ts";
import { getTaskFromStep } from "../parser/playbook/stepsToplaybook.ts";
import { updateCardByIndex } from "./updateCardByIndex.ts";

export const queryForStepTask = async (step, cb) => {
  if (Object.keys(step.errors ?? {}).length > 0) {
    cb({}, false);
    return;
  }

  let body = {
    playbook_task_definition: getTaskFromStep(step),
    meta: {
      time_range: rangeSelector(store.getState()),
    },
  };

  if (
    Object.keys(body?.playbook_task_definition?.documentation_task ?? {})
      .length > 0
  ) {
    cb(
      {
        step: step,
        data: null,
        timestamp: new Date().toTimeString(),
        title: getStepTitle(step),
      },
      true,
    );
    return;
  }

  try {
    const response = await store
      .dispatch(executePlaybook.initiate(body))
      .unwrap();
    cb(
      {
        step: step,
        data: response,
        timestamp: new Date().toTimeString(),
        title: getStepTitle(step),
      },
      true,
    );
  } catch (e) {
    updateCardByIndex("outputError", e.err);
    console.error(e);
    cb(
      {
        error: e.err,
      },
      false,
    );
  }
};
