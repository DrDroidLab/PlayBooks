import { Step } from "./step.ts";

export enum LogicalOperator {
  AND_LO = "AND_LO",
  OR_LO = "OR_LO",
  NOT_LO = "NOT_LO",
}

enum RuleType {
  TIMESERIES = "timeseries",
  TABLE = "table",
}

export type ConditionRule = {
  type: string;
  task: any;
} & {
  [key in RuleType]?: any;
};

type StepCondition = {
  rules: ConditionRule[];
  logical_opertaor: LogicalOperator;
};

export type StepRelationContract = {
  id: string;
  parent: {
    reference_id: string;
  };
  child: {
    reference_id: string;
  };
  condition?: StepCondition;
};

export type StepRelation = {
  id: string;
  parent: Step | string;
  child: Step;
  condition?: StepCondition;
};
