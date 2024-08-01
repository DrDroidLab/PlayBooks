import { OperatorOptionType } from "../../utils/conditionals/types/operatorOptionTypes.ts";
import { Step } from "./steps/step.ts";

export enum LogicalOperator {
  AND_LO = "AND_LO",
  OR_LO = "OR_LO",
  NOT_LO = "NOT_LO",
}

export enum StepRuleTypes {
  COMPARE_TIME_WITH_CRON = "compare_time_with_cron",
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

export type StepRuleType = {
  [key in StepRuleTypes]: {
    operator: OperatorOptionType;
    rule: string;
    within_seconds: number;
  };
};

export type StepRule = {
  type: StepRuleTypes;
} & StepRuleType;

type StepCondition = {
  rules: ConditionRule[];
  step_rules: StepRule[];
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
