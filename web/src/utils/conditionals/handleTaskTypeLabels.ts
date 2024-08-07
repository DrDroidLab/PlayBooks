import { taskTypes } from "../../constants/index.ts";
import { Task } from "../../types/index.ts";
import { Key } from "../playbook/key.ts";

function handleTaskTypeLabels(task?: Task): {
  label: string;
  labelValue: string;
} {
  const defaultVal = { label: "", labelValue: "" };
  if (!task || !task?.source) return defaultVal;
  const source = task.source;
  if (!source) return defaultVal;
  const taskType = task[source?.toLowerCase()]?.type;
  if (!taskType) return defaultVal;
  const taskData = task[source?.toLowerCase()][taskType.toLowerCase()];
  if (!taskData) return defaultVal;
  const type = `${source} ${taskType}`;
  let labelValue: string = "";

  switch (type) {
    case taskTypes.API_HTTP_REQUEST:
      labelValue = taskData[Key.METRIC_NAME];
      break;
    case taskTypes.CLOUDWATCH_LOG_GROUP:
    case taskTypes.AZURE_FILTER_LOG_EVENTS:
      labelValue = taskData[Key.FILTER_QUERY];
      break;
    case taskTypes.BASH_COMMAND:
      labelValue = taskData[Key.COMMAND];
      break;
    case taskTypes.SQL_DATABASE_CONNECTION_SQL_QUERY:
    case taskTypes.POSTGRES_SQL_QUERY:
    case taskTypes.GRAFANA_LOKI_QUERY_LOGS:
    case taskTypes.CLICKHOUSE_SQL_QUERY:
      labelValue = taskData[Key.QUERY];
      break;
    case taskTypes.CLOUDWATCH_METRIC:
      labelValue = taskData[Key.METRIC_NAME];
      break;
    case taskTypes.DATADOG_SERVICE_METRIC_EXECUTION:
      labelValue = taskData[Key.METRIC];
      break;
    case taskTypes.DATADOG_QUERY_METRIC_EXECUTION:
      labelValue = `${taskData[Key.QUERY1]} ${taskData[Key.QUERY2]}`;
      break;
    case taskTypes.EKS_GET_EVENTS:
    case taskTypes.EKS_GET_PODS:
    case taskTypes.EKS_GET_SERVICES:
    case taskTypes.EKS_GET_DEPLOYMENTS:
      labelValue = taskData[Key.NAMESPACE];
      break;
    case taskTypes.ELASTIC_SEARCH_QUERY_LOGS:
      labelValue = taskData[Key.LUCENE_QUERY];
      break;
    case taskTypes.GKE_GET_DEPLOYMENTS:
    case taskTypes.GKE_GET_EVENTS:
    case taskTypes.GKE_GET_PODS:
    case taskTypes.GKE_GET_SERVICES:
      labelValue = taskData[Key.NAMESPACE];
      break;
    case taskTypes.GRAFANA_MIMIR_PROMQL_METRIC_EXECUTION:
    case taskTypes.GRAFANA_PROMETHEUS_DATASOURCE:
      labelValue = taskData[Key.PROMQL_EXPRESSION];
      break;
    case taskTypes.DOCUMENTATION_IFRAME:
      labelValue = taskData[Key.IFRAME_URL];
      break;
    case taskTypes.NEW_RELIC_ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION:
      labelValue = taskData[Key.GOLDEN_METRIC_NAME];
      break;
    case taskTypes.NEW_RELIC_ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION:
      labelValue = taskData[Key.WIDGET_NRQL_EXPRESSION];
      break;
    case taskTypes.NEW_RELIC_NRQL_METRIC_EXECUTION:
      labelValue = taskData[Key.NRQL_EXPRESSION];
      break;
    default:
      return {
        label: task.description ?? "",
        labelValue: task.description ?? "",
      };
  }

  return {
    label: `${task.description}${labelValue ? " - " : ""}${labelValue}`,
    labelValue,
  };
}

export default handleTaskTypeLabels;
