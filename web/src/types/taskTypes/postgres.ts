import { TaskType } from "../index.ts";

export interface Postgres {
  type: TaskType.Postgres;
  // Add specific fields for Postgres task
}
