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
  stepId: string,
): StepInformationType[] {
  const [step] = getCurrentTask(stepId);
  const type = `${step.source} ${step.taskType}`;

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
      return StepInformation.newRelicApplication;
    case taskTypes.AZURE_FILTER_LOG_EVENTS:
      return [];
    case taskTypes.NEW_RELIC_ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION:
      return [];
    case taskTypes.NEW_RELIC_ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION:
      return [];
    case taskTypes.EKS_GET_DEPLOYMENTS:
      return [];
    case taskTypes.EKS_GET_EVENTS:
      return [];
    case taskTypes.EKS_GET_PODS:
      return [];
    case taskTypes.EKS_GET_SERVICES:
      return [];
    case taskTypes.GKE_GET_DEPLOYMENTS:
      return [];
    case taskTypes.GKE_GET_EVENTS:
      return [];
    case taskTypes.GKE_GET_PODS:
      return [];
    case taskTypes.GKE_GET_SERVICES:
      return [];
    case taskTypes.BASH_COMMAND:
      return [];
    case taskTypes.DATADOG_QUERY_METRIC_EXECUTION:
      return [];
    case taskTypes.API_HTTP_REQUEST:
      return [];
    case taskTypes.SQL_DATABASE_CONNECTION_SQL_QUERY:
      return [];
    case taskTypes.GRAFANA_MIMIR_PROMQL_METRIC_EXECUTION:
      return [];
    case taskTypes.DOCUMENTATION_IFRAME:
      return [];

    default:
      return [];
  }
}
