import { models } from "../constants/index.ts";

export const integrationSentenceMap = {
  [models.CLOUDWATCH_LOG_GROUP]: "Fetch logs from Cloudwatch",
  [models.NEW_RELIC_ENTITY_DASHBOARD]: "Fetch a metric from a dashboard",
  [models.NEW_RELIC_ENTITY_APPLICATION]: "Fetch a golden metric",
  [models.NEW_RELIC_NRQL]: "Fetch a custom NRQL query",
  [models.DATADOG]: "Fetch a metric by service",
  [models.DATADOG_QUERY]: "Fetch a custom metric",
  [models.CLOUDWATCH_METRIC]: "Fetch a metric from Cloudwatch",
  [models.GRAFANA]:
    "Query any of your Prometheus based dashboard panels from Grafana",
  [models.CLICKHOUSE]: "Query a Clickhouse Database",
  [models.POSTGRES_DATABASE]: "Query a PostgreSQL Database",
  [models.EKS_CLUSTER]: "Query Events from your EKS Cluster",
  [models.API]: "Trigger an API",
};

export const integrations = [
  {
    id: "actions",
    label: "Actions",
    options: [models.API],
  },
  {
    id: "logs",
    label: "Logs",
    options: [models.CLOUDWATCH_LOG_GROUP],
  },
  {
    id: "metrics",
    label: "Metrics",
    options: [
      models.NEW_RELIC_ENTITY_DASHBOARD,
      models.NEW_RELIC_ENTITY_APPLICATION,
      models.NEW_RELIC_NRQL,
      models.DATADOG,
      models.DATADOG_QUERY,
      models.CLOUDWATCH_METRIC,
      models.GRAFANA,
    ],
  },
  {
    id: "database",
    label: "Database",
    options: [models.CLICKHOUSE, models.POSTGRES_DATABASE],
  },
  {
    id: "others",
    label: "Others",
    options: [models.EKS_CLUSTER],
  },
];
