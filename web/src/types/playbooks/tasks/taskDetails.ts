import {
  Azure,
  Bash,
  Clickhouse,
  Cloudwatch,
  Datadog,
  Documentation,
  Eks,
  ElasticSearch,
  Gke,
  Grafana,
  GrafanaMimir,
  NewRelic,
  Postgres,
  SqlDatabaseConnection,
  Api,
} from "../../taskTypes";
import { Slack } from "../../taskTypes/slack";
import { Sources } from "../sources";

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
  [Sources.Slack]: Slack;
};

export type TaskDetails = {
  [K in keyof TaskDetailsMapping]: {
    type: K;
    process_function: string;
    statistic: string;
  } & { [P in K]: TaskDetailsMapping[K] };
}[keyof TaskDetailsMapping];
