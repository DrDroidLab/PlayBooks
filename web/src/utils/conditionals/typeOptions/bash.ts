import { OperatorOptions } from "../types/operatorOptionTypes.ts";
import { RuleTypes } from "../types/ruleTypes.ts";

export const bashCommandOutputOptions = [
  {
    id: RuleTypes.GREP,
    label: "Grep Pattern exists",
    defaultValues: {
      threshold: 1,
      operator: OperatorOptions.GREATER_THAN_EQUAL_O,
      case_sensitive: false,
    },
  },
  {
    id: RuleTypes.NO_GREP,
    label: "Grep Pattern does not exist",
    defaultValues: {
      threshold: 0,
      operator: OperatorOptions.EQUAL_O,
      case_sensitive: false,
    },
  },
  {
    id: RuleTypes.GREP_COUNT,
    label: "Count occurrences of Grep Pattern",
    defaultValues: {
      case_sensitive: false,
    },
  },
];
