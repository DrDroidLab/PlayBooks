import { OperatorOptions } from "../types/operatorOptionTypes.ts";
import { RuleTypes } from "../types/ruleTypes.ts";

export const bashCommandOutputOptions = [
  {
    id: RuleTypes.GREP,
    label: "Grep Pattern exists",
    defaultValues: {
      numeric_value_threshold: 1,
      string_value_threshold: undefined,
      operator: OperatorOptions.GREATER_THAN_EQUAL_O,
    },
  },
  {
    id: RuleTypes.NO_GREP,
    label: "Grep Pattern does not exist",
    defaultValues: {
      numeric_value_threshold: 0,
      string_value_threshold: undefined,
      operator: OperatorOptions.EQUAL_O,
    },
  },
  {
    id: RuleTypes.GREP_COUNT,
    label: "Count occurrences of Grep Pattern",
    defaultValues: {
      numeric_value_threshold: undefined,
      string_value_threshold: undefined,
      operator: undefined,
      case_sensitive: false,
    },
  },
];
