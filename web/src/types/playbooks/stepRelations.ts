import { OperatorOptionType } from "../../utils/conditionals/types/operatorOptionTypes.ts";
import { LowercaseString } from "../common/lowercaseString.ts";
import { Step } from "./steps/step.ts";

export enum LogicalOperator {
  AND_LO = "AND_LO",
  OR_LO = "OR_LO",
  NOT_LO = "NOT_LO",
}

export enum StepRuleTypes {
  COMPARE_TIME_WITH_CRON = "COMPARE_TIME_WITH_CRON",
}

export enum VariableRuleTypes {
  COMPARE_GLOBAL_VARIABLE = "COMPARE_GLOBAL_VARIABLE",
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

export type VariableConditionRuleType = {
  [key in VariableRuleTypes as LowercaseString<VariableRuleTypes>]: {
    variable_name: string;
    operator: OperatorOptionType;
    threshold: string;
  };
};

export type VariableConditionRule = {
  type: VariableRuleTypes;
} & VariableConditionRuleType;

export type StepRuleType = {
  [key in StepRuleTypes as LowercaseString<StepRuleTypes>]: {
    operator: OperatorOptionType;
    rule: string;
    within_seconds: number;
  };
};

export type StepRule = {
  type: StepRuleTypes;
} & StepRuleType;

export type ConditionRuleSet = {
  rules: ConditionRule[];
  variable_rules?: VariableConditionRule[];
  step_rules?: StepRule[];
  logical_operator: LogicalOperator;
};

type StepCondition = {
  rule_sets: ConditionRuleSet[];
  logical_operator: LogicalOperator;
};

export type StepRelationContract = {
  id: string;
  parent: {
    reference_id: string;
  };
  child?: {
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
