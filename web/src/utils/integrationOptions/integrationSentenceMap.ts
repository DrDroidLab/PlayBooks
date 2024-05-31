import { models } from "../../constants/index.ts";

export const integrationSentenceMap = {
  [models.CLOUDWATCH_LOG_GROUP]: "Fetch logs from Cloudwatch",
  [models.NEW_RELIC_ENTITY_DASHBOARD]: "Fetch a metric from a dashboard",
  [models.NEW_RELIC_ENTITY_APPLICATION]: "Fetch a golden metric",
  [models.NEW_RELIC_NRQL]: "Fetch a custom NRQL query",
  [models.DATADOG]: "Fetch a metric by service",
  [models.DATADOG_QUERY]: "Fetch a custom metric",
  [models.CLOUDWATCH_METRIC]: "Fetch a metric from Cloudwatch",
  [models.GRAFANA_DATASOURCE]:
    "Query any of your Prometheus based Grafana Data Sources",
  [models.CLICKHOUSE]: "Query a Clickhouse Database",
  [models.POSTGRES_DATABASE]: "Query a PostgreSQL Database",
  [models.EKS_CLUSTER]: "Query Events from your EKS Cluster",
  [models.API]: "Trigger an API",
  [models.TEXT]: "Write documentation",
  [models.BASH]: "Execute a BASH command",
  [models.SQL_DATABASE_CONNECTION]: "Query from your configured SQL Database",
  [models.GRAFANA_MIMIR_PROMQL]: "Query Metrics from Mimir",
  [models.AZURE_WORKSPACE]: "Query Logs from Azure",
};
