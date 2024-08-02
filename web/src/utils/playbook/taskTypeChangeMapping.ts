import { taskTypes } from "../../constants/index.ts";
import * as ChangeHandlers from "./changeHandlers/index.ts";

export const taskTypeChangeMapping = {
  [taskTypes.NEW_RELIC_ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION]:
    ChangeHandlers.nrGoldenMetrics,
  [taskTypes.NEW_RELIC_ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION]:
    ChangeHandlers.nrDashboard,
};
