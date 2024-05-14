import { models } from "../../constants/index.ts";
import { PlaybookTask } from "../../types.ts";
import { injectNewRelicEntityApplicationTasks } from "./newRelicEntityApplication.ts";
import { injectNewRelicEntityDashboardTasks } from "./newRelicEntityDashboard.ts";
import { injectNewRelicNrqlTasks } from "./newRelicNrql.ts";
import { Step } from "../../types/index.ts";

export const injectNewRelicTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let tasks: PlaybookTask[] = [];
  switch (step.modelType) {
    case models.NEW_RELIC_ENTITY_DASHBOARD:
      tasks = injectNewRelicEntityDashboardTasks(step, baseTask);
      break;
    case models.NEW_RELIC_ENTITY_APPLICATION:
      tasks = injectNewRelicEntityApplicationTasks(step, baseTask);
      break;

    case models.NEW_RELIC_NRQL:
      tasks = injectNewRelicNrqlTasks(step, baseTask);
      break;
  }

  return tasks;
};
