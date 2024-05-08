import { SOURCES } from "../../../constants/index.ts";
import * as Extractor from "../../extractors/index.ts";

export const handleStepSourceExtractor = (step) => {
  let data: any = {};
  let stepSource = step.tasks
    ? step?.tasks[0].metric_task
      ? step.tasks[0].metric_task.source
      : step.tasks[0].data_fetch_task
      ? step.tasks[0].data_fetch_task.source
      : step.tasks[0].action_task?.source ?? step?.tasks[0].type
    : "";

  switch (stepSource) {
    case SOURCES.CLOUDWATCH:
      data = Extractor.extractCloudwatchTasks(step);
      break;
    case SOURCES.GRAFANA_VPC:
    case SOURCES.GRAFANA:
      data = Extractor.extractGrafanaTasks(step);
      break;
    case SOURCES.CLICKHOUSE:
      data = Extractor.extractClickhouseTasks(step);
      break;
    case SOURCES.POSTGRES:
      data = Extractor.extractPostgresTasks(step);
      break;
    case SOURCES.EKS:
      data = Extractor.extractEksTasks(step);
      break;
    case SOURCES.NEW_RELIC:
      data = Extractor.extractNewRelicTasks(step);
      break;
    case SOURCES.DATADOG:
      data = Extractor.extracDatadogTasks(step);
      break;
    case SOURCES.API:
      data = Extractor.extractApiTasks(step);
      break;
    default:
      break;
  }

  return data;
};
