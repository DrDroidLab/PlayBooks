import { getStepTitle } from "../../components/Playbooks/utils";
import { store } from "../../store/index.ts";
import { executePlaybookTask } from "../../store/features/playbook/api/index.ts";
import { rangeSelector } from "../../store/features/timeRange/timeRangeSlice.ts";
import { updateCardByIndex } from "./updateCardByIndex.ts";
import { isPlaybookTaskArray } from "../isPlaybookArray.ts";
import stepToTasks from "../parser/playbook/stepToTasks.ts";

export const queryForStepTask = async (step, cb) => {
  if (Object.keys(step.errors ?? {}).length > 0) {
    cb({}, false);
    return;
  }

  const tasks = stepToTasks(step);
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

  try {
    const promises = bodies.map((body) =>
      store.dispatch(executePlaybookTask.initiate(body)).unwrap(),
    );

    const responses = await Promise.all(promises);
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
