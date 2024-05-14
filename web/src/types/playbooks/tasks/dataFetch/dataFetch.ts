import {
  ClickhouseDataFetchTask,
  KubernetesDataFetchTask,
  PostgresDataFetchTask,
} from "./index.ts";

export interface DataFetchTask {
  source: string;
  clickhouse_data_fetch_task?: ClickhouseDataFetchTask;
  postgres_data_fetch_task?: PostgresDataFetchTask;
  eks_data_fetch_task?: KubernetesDataFetchTask;
}
