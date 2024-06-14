import { Step } from "../../types.ts";
import { taskTypeMapping } from "../taskTypeMapping.ts";

enum TaskTypes {
  METRIC_EXECUTION = "metric_execution",
  DATA_FETCH = "data_fetch",
  OTHERS = "others",
}

const checkMapping = (taskType: string) => {
  if (taskTypeMapping[TaskTypes.METRIC_EXECUTION].includes(taskType)) {
    return TaskTypes.METRIC_EXECUTION;
  }

  if (taskTypeMapping[TaskTypes.DATA_FETCH].includes(taskType)) {
    return TaskTypes.DATA_FETCH;
  }

  return TaskTypes.OTHERS;
};

export const functionOptions = (step: Step) => {
  const type = checkMapping(`${step.source} ${step.taskType}`);

  switch (type) {
    case TaskTypes.METRIC_EXECUTION:
      return [
        {
          id: "avg",
          label: "Average",
        },
        {
          id: "max",
          label: "Max",
        },
        {
          id: "min",
          label: "Min",
        },
        {
          id: "latest",
          label: "Latest",
        },
      ];
    case TaskTypes.DATA_FETCH:
      return [
        {
          id: "count",
          label: "Count of results",
        },
        {
          id: "result",
          label: "Query result Value",
        },
        {
          id: "list",
          label: "Query result List of values",
        },
      ];
    default:
      return [];
  }
};
