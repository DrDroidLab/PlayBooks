import { TaskType } from "./index.ts";
import {
  Documentation,
  Cloudwatch,
  Grafana,
  Datadog,
  Clickhouse,
  NewRelic,
  Postgres,
  Eks,
  SqlDatabaseConnection,
  Api,
  Bash,
  GrafanaMimir,
  Azure,
  Gke,
  ElasticSearch,
} from "./taskTypes/index.ts";

export type TaskDetails = {
  [K in TaskType]?: K extends TaskType.Documentation
    ? Documentation
    : K extends TaskType.Cloudwatch
    ? Cloudwatch
    : K extends TaskType.Grafana
    ? Grafana
    : K extends TaskType.NewRelic
    ? NewRelic
    : K extends TaskType.Datadog
    ? Datadog
    : K extends TaskType.Clickhouse
    ? Clickhouse
    : K extends TaskType.Postgres
    ? Postgres
    : K extends TaskType.Eks
    ? Eks
    : K extends TaskType.SqlDatabaseConnection
    ? SqlDatabaseConnection
    : K extends TaskType.Api
    ? Api
    : K extends TaskType.Bash
    ? Bash
    : K extends TaskType.GrafanaMimir
    ? GrafanaMimir
    : K extends TaskType.Azure
    ? Azure
    : K extends TaskType.Gke
    ? Gke
    : K extends TaskType.ElasticSearch
    ? ElasticSearch
    : never;
};
