import { PlaybookTask } from "../types";

export function isPlaybookTaskArray(value: any): value is PlaybookTask[] {
  return (
    Array.isArray(value) &&
    value.every((task) => task && task.type === "METRIC")
  );
}
