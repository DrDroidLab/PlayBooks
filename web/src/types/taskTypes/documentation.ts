import { TaskType } from "../index.ts";

export interface Documentation {
  type: TaskType.Documentation;
  content: string;
}
