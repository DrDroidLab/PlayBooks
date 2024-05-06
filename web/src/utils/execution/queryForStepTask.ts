import { getStepTitle } from "../../components/Playbooks/utils";
import { store } from "../../store/index.ts";
import { executePlaybook } from "../../store/features/playbook/api/index.ts";
import { rangeSelector } from "../../store/features/timeRange/timeRangeSlice.ts";
import { getTaskFromStep } from "../parser/playbook/stepsToplaybook.ts";
import { updateCardByIndex } from "./updateCardByIndex.ts";
import { isPlaybookTaskArray } from "../isPlaybookArray.ts";

export const queryForStepTask = async (step, cb) => {
  if (Object.keys(step.errors ?? {}).length > 0) {
    cb({}, false);
    return;
  }

  const tasks = getTaskFromStep(step);
  let bodies: any[] = [];

  if (isPlaybookTaskArray(tasks)) {
    bodies = (tasks as []).map((task) => {
      let body = {
        playbook_task_definition: task,
        meta: {
          time_range: rangeSelector(store.getState()),
        },
      };
      return body;
    });
  } else {
    bodies.push({
      playbook_task_definition: tasks,
      meta: {
        time_range: rangeSelector(store.getState()),
      },
    });
  }

  // if (
  //   Object.keys(body?.playbook_task_definition?.documentation_task ?? {})
  //     .length > 0
  // ) {
  //   cb(
  //     {
  //       step: step,
  //       data: null,
  //       timestamp: new Date().toTimeString(),
  //       title: getStepTitle(step),
  //     },
  //     true,
  //   );
  //   return;
  // }

  try {
    const promises = bodies.map((body) =>
      store.dispatch(executePlaybook.initiate(body)).unwrap(),
    );

    const responses = await Promise.all(promises);
    // const response = await store
    //   .dispatch(executePlaybook.initiate(body))
    //   .unwrap();
    cb(
      {
        step: step,
        data: responses,
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
        error: e.message,
      },
      false,
    );
  }
};
