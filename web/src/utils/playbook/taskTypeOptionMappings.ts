import { taskTypes } from "../../constants/index.ts";
import * as Options from "./options/index.ts";

export const taskTypeOptionMappings = {
  [taskTypes.AZURE_FILTER_LOG_EVENTS]: Options.azureFilterLogEvents,
  [taskTypes.BASH_COMMAND]: Options.bashCommand,
  [taskTypes.CLICKHOUSE_SQL_QUERY]: Options.clickhouseSqlQuery,
  [taskTypes.CLOUDWATCH_LOG_GROUP]: Options.cloudwatchLogs,
  [taskTypes.CLOUDWATCH_METRIC]: Options.cloudwatchMetrics,
  [taskTypes.DATADOG_SERVICE_METRIC_EXECUTION]: Options.datadogService,
  [taskTypes.EKS_GET_DEPLOYMENTS]: Options.eks,
  [taskTypes.EKS_GET_EVENTS]: Options.eks,
  [taskTypes.EKS_GET_PODS]: Options.eks,
  [taskTypes.EKS_GET_SERVICES]: Options.eks,
  [taskTypes.EKS_KUBECTL_COMMAND]: Options.eks,
  [taskTypes.ELASTIC_SEARCH_QUERY_LOGS]: Options.elasticSearchQueryLogs,
  [taskTypes.GKE_GET_DEPLOYMENTS]: Options.gke,
  [taskTypes.GKE_GET_EVENTS]: Options.gke,
  [taskTypes.GKE_GET_PODS]: Options.gke,
  [taskTypes.GKE_GET_SERVICES]: Options.gke,
  [taskTypes.GKE_KUBECTL_COMMAND]: Options.gke,
  [taskTypes.SLACK_SEND_MESSAGE]: Options.slackSendMessage,
  [taskTypes.GRAFANA_PROMETHEUS_DATASOURCE]:
    Options.grafanaPrometheusDatasource,
  [taskTypes.NEW_RELIC_ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION]:
    Options.nrGoldenMetrics,
  [taskTypes.NEW_RELIC_ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION]:
    Options.nrDashboard,
  [taskTypes.ARGOCD_FETCH_DEPLOYMENT_INFO]: Options.argoCd,
  [taskTypes.ARGOCD_ROLLBACK_APPLICATION]: Options.argoCd,
  [taskTypes.ARGOCD_GET_APPLICATION_HEALTH]: Options.argoCd,
  [taskTypes.JIRA_CREATE_TICKET]: Options.jiraCloud,
  [taskTypes.JIRA_GET_USERS]: Options.jiraCloud,
  [taskTypes.JIRA_ASSIGN_TICKET]: Options.jiraCloud,
  [taskTypes.JIRA_GET_TICKET]: Options.jiraCloud,
  [taskTypes.JIRA_SEARCH_TICKETS]: Options.jiraCloud,
};
