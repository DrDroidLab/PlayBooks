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

export type RelationEvaluation = {
  evaluation_result: boolean;
  evaluation_output: any;
};

export type StepRelationUIRequirement = {
  playbookRelationId?: string;
  evaluation?: RelationEvaluation;
};

export type ConditionRule = {
  type: string;
  task: {
    reference_id?: string;
    id?: string;
  };
} & {
  [key in RuleType]?: any;
};

type StepCondition = {
  rules: ConditionRule[];
  logical_operator: LogicalOperator;
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
  ui_requirement?: StepRelationUIRequirement;
};

export type StepRelation = {
  id: string;
  parent: Step | string;
  child: Step;
  condition?: StepCondition;
  ui_requirement?: StepRelationUIRequirement;
};
