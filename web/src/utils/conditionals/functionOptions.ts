import { Step } from "../../types.ts";

enum ResultTypeTypes {
  TIMESERIES = "TIMESERIES",
  TABLE = "TABLE",
  OTHERS = "others",
}

export const functionOptions = (step: Step) => {
  const type = step.resultType;

  switch (type) {
    case ResultTypeTypes.TIMESERIES:
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
    case ResultTypeTypes.TABLE:
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
