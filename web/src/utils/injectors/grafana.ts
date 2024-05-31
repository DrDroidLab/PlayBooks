import { models } from "../../constants/index.ts";
import { PlaybookTask, Step } from "../../types.ts";
import { injectGrafanaPromQLTasks } from "./grafanaPromQL.ts";
import { injectGrafanaDataSourceTasks } from "./grafanaDataSource.ts";

export const injectGrafanaTasks = (
  step: Step,
  baseTask: PlaybookTask,
): PlaybookTask[] => {
  let tasks: PlaybookTask[] = [];
  switch (step.modelType) {
    case models.GRAFANA:
      tasks = injectGrafanaPromQLTasks(step, baseTask);
      break;
    case models.GRAFANA_DATASOURCE:
      tasks = injectGrafanaDataSourceTasks(step, baseTask);
  }

  return tasks;
};

