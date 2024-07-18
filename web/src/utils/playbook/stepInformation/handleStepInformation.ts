import { taskTypes } from "../../../constants/index.ts";
import getCurrentTask from "../../getCurrentTask.ts";
import * as StepInformation from "./index.ts";
import { InfoType } from "./InfoTypes.ts";

export type StepInformationType = {
  label: string;
  key: string;
  type: InfoType;
};

export default function handleStepInformation(
  taskId: string,
): StepInformationType[] {
  const [task] = getCurrentTask(taskId);
  const source = task?.source ?? "";
  const taskType = task?.[source?.toLowerCase()]?.type;
  const type = `${source} ${taskType}`;

  switch (type) {
    case taskTypes.CLOUDWATCH_METRIC:
      return StepInformation.cloudwatchMetric;
    case taskTypes.POSTGRES_SQL_QUERY:
      return StepInformation.postgres;
    case taskTypes.CLICKHOUSE_SQL_QUERY:
      return StepInformation.clickhouse;
    case taskTypes.CLOUDWATCH_LOG_GROUP:
      return StepInformation.cloudwatchLogGroup;
    case taskTypes.DATADOG_SERVICE_METRIC_EXECUTION:
      return StepInformation.datadogService;
    case taskTypes.GRAFANA_PROMETHEUS_DATASOURCE:
      return StepInformation.grafanaPromQL;
    case taskTypes.NEW_RELIC_NRQL_METRIC_EXECUTION:
      return StepInformation.nrql;
    case taskTypes.AZURE_FILTER_LOG_EVENTS:
      return StepInformation.azureLogs;
    case taskTypes.NEW_RELIC_ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION:
      return StepInformation.newRelicApplication;
    case taskTypes.NEW_RELIC_ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION:
      return StepInformation.newRelicDashboard;
    case taskTypes.EKS_GET_DEPLOYMENTS:
    case taskTypes.EKS_GET_EVENTS:
    case taskTypes.EKS_GET_PODS:
    case taskTypes.EKS_GET_SERVICES:
      return StepInformation.eks;
    case taskTypes.GKE_GET_DEPLOYMENTS:
    case taskTypes.GKE_GET_EVENTS:
    case taskTypes.GKE_GET_PODS:
    case taskTypes.GKE_GET_SERVICES:
      return StepInformation.eks;
    case taskTypes.BASH_COMMAND:
      return StepInformation.bash;
    case taskTypes.DATADOG_QUERY_METRIC_EXECUTION:
      return StepInformation.datadogCustom;
    case taskTypes.API_HTTP_REQUEST:
      return StepInformation.api;
    case taskTypes.SQL_DATABASE_CONNECTION_SQL_QUERY:
      return StepInformation.sql;
    case taskTypes.GRAFANA_MIMIR_PROMQL_METRIC_EXECUTION:
      return StepInformation.mimir;
    case taskTypes.GRAFANA_LOKI_QUERY_LOGS:
      return StepInformation.loki;
    case taskTypes.ELASTIC_SEARCH_QUERY_LOGS:
      return StepInformation.elasticSearch;
    case taskTypes.DOCUMENTATION_IFRAME:
      return [];
    case taskTypes.DOCUMENTATION_MARKDOWN:
      return StepInformation.markdown;

    default:
      return [];
  }
}
