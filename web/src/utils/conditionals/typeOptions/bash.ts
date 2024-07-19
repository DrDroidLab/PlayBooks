import { GrepRuleTypes } from "../types/grepRuleTypes.ts";
import { RuleTypes } from "../types/ruleTypes.ts";

export const bashCommandOutputOptions = [
  {
    id: GrepRuleTypes.GREP_EXISTS,
    label: "Grep Pattern exists",
    type: RuleTypes.GREP_COUNT,
  },
  {
    id: GrepRuleTypes.GREP_DOES_NOT_EXIST,
    label: "Grep Pattern does not exist",
    type: RuleTypes.GREP_COUNT,
  },
  {
    id: GrepRuleTypes.GREP_COUNT,
    label: "Count occurrences of Grep Pattern",
    type: RuleTypes.GREP_COUNT,
  },
];
