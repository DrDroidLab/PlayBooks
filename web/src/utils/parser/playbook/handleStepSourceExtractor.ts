import { SOURCES } from "../../../constants/index.ts";
import * as Extractor from "../../extractors/index.ts";

export const handleStepSourceExtractor = (step) => {
  let data: any = {};
  let stepSource = step.tasks ? step.tasks[0].source : "";

  const taskIds = step.tasks ? step.tasks?.map((task) => task.id) : [];

  switch (stepSource) {
    case SOURCES.CLOUDWATCH:
      data = Extractor.extractCloudwatchTasks(step);
      break;
    case SOURCES.AZURE:
      data = Extractor.extractAzureTasks(step);
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
    case SOURCES.GKE:
      data = Extractor.extractGkeTasks(step);
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
    case SOURCES.TEXT:
      data = Extractor.extractTextTasks(step);
      break;
    case SOURCES.GRAFANA_MIMIR:
      data = Extractor.extractMimirTasks(step);
      break;
    case SOURCES.BASH:
      data = Extractor.extractBashTasks(step);
      break;
    case SOURCES.SQL_DATABASE_CONNECTION:
      data = Extractor.extractSqlRawQueryTasks(step);
      break;
    case SOURCES.GRAFANA_LOKI:
      data = Extractor.extractLokiTasks(step);
      break;
    default:
      break;
  }

  return { ...data, taskIds, showNotes: step?.notes ?? false };
};
