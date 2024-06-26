import { models } from "../../constants/index.ts";

export const integrations = [
  {
    id: "documentation",
    label: "View",
    options: [
      models.TEXT,
      models.IFRAME
    ],
  },
  {
    id: "actions",
    label: "Actions",
    options: [models.API, models.BASH],
  },
  {
    id: "logs",
    label: "Logs",
    options: [
      models.CLOUDWATCH_LOG_GROUP, 
      models.AZURE_WORKSPACE
    ],
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
      models.GRAFANA_DATASOURCE,
      models.GRAFANA_MIMIR_PROMQL
    ],
  },
  {
    id: "database",
    label: "Database",
    options: [
      models.CLICKHOUSE,
      models.POSTGRES_DATABASE,
      models.SQL_DATABASE_CONNECTION,
    ],
  },
  {
    id: "others",
    label: "Others",
    options: [models.EKS_CLUSTER],
  },
];
