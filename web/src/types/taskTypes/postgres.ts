import { TaskType } from "../index.ts";

type SQLQuery = {
  database: string;
  query: string;
};

export interface Postgres {
  type: TaskType.Postgres;
  sql_query: SQLQuery;
}
