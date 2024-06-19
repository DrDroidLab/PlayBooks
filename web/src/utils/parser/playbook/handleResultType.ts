import {
  ResultTypeType,
  ResultTypeTypes,
} from "../../conditionals/resultTypeOptions.ts";

function handleResultType(resultType: ResultTypeType, condition: any) {
  switch (resultType) {
    case ResultTypeTypes.TABLE:
      return {
        type: condition.type,
        operator: condition.operation,
        threshold: condition.value,
        [condition.isNumeric
          ? "numeric_value_threshold"
          : "string_value_threshold"]: condition.threshold,
      };
    case ResultTypeTypes.TIMESERIES:
      return {
        type: condition.type,
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
