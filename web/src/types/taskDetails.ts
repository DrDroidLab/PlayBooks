import { Sources } from "./sources.ts";
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

type TaskDetailsMapping = {
  [Sources.Documentation]: Documentation;
  [Sources.Cloudwatch]: Cloudwatch;
  [Sources.Grafana]: Grafana;
  [Sources.Datadog]: Datadog;
  [Sources.Clickhouse]: Clickhouse;
  [Sources.NewRelic]: NewRelic;
  [Sources.Postgres]: Postgres;
  [Sources.Eks]: Eks;
  [Sources.SqlDatabaseConnection]: SqlDatabaseConnection;
  [Sources.Api]: Api;
  [Sources.Bash]: Bash;
  [Sources.GrafanaMimir]: GrafanaMimir;
  [Sources.Azure]: Azure;
  [Sources.Gke]: Gke;
  [Sources.ElasticSearch]: ElasticSearch;
};

export type TaskDetails = {
  [K in keyof TaskDetailsMapping]: {
    type: K;
  } & { [P in K]: TaskDetailsMapping[K] };
}[keyof TaskDetailsMapping];
