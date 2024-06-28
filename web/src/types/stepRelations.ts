import { Step } from "./step.ts";

enum LogicalOperator {
  AND_LO = "AND_LO",
  OR_LO = "OR_LO",
  NOT_LO = "NOT_LO",
}

enum RuleType {
  TIMESERIES = "timeseries",
  TABLE = "table",
}

type ConditionRule = {
  type: string;
  task: any;
  rule: {
    [key in RuleType]: any;
  };
};

type StepCondition = {
  rules: ConditionRule;
  logical_opertaor: LogicalOperator;
};

export type StepRelation = {
  id: string;
  parent: Step;
  child: Step;
  condition?: StepCondition;
};
