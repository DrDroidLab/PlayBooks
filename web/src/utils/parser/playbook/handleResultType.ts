import {
  ResultTypeType,
  ResultTypeTypes,
} from "../../conditionals/resultTypeOptions.ts";

function handleResultType(resultType: ResultTypeType, condition: any) {
  console.log(
    "condition",
    condition,
    condition.isNumeric || condition.conditionType === "ROW_COUNT",
  );
  switch (resultType) {
    case ResultTypeTypes.TABLE:
      return {
        type: condition.conditionType,
        operator: condition.operation,
        column_name: condition.columnName,
        [condition.isNumeric || condition.conditionType === "ROW_COUNT"
          ? "numeric_value_threshold"
          : "string_value_threshold"]: condition.value,
      };
    case ResultTypeTypes.TIMESERIES:
      return {
        type: condition.conditionType,
        function: condition.function,
        operator: condition.operation,
        threshold: condition.value,
        window: condition.window,
      };
    default:
      return {};
  }
}

export default handleResultType;
