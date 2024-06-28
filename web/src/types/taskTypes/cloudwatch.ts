import { TaskType } from "../index.ts";

export interface Cloudwatch {
  type: TaskType.Cloudwatch;
  namespace: string;
  metrics: string[];
}
